import { useEffect, useState } from 'react';
import api from '../utils/api';

export interface Alerta {
  id: string;
  tipo: 'estoque_baixo' | 'quase_expirado' | 'expirado' | 'baixa_rotatividade';
  mensagem: string;
  produto: string;
  quantidade?: number;
  dias_restantes?: number;
  gravidade: 'alta' | 'media' | 'baixa';
  data: Date;
  lida: boolean;
}

class AlertService {
  private alertas: Alerta[] = [];
  private listeners: ((alertas: Alerta[]) => void)[] = [];
  private intervalId: NodeJS.Timeout | null = null;

  // Adicionar listener para componentes
  subscribe(listener: (alertas: Alerta[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notificar todos os listeners
  private notificar() {
    this.listeners.forEach(listener => listener([...this.alertas]));
  }

  // Buscar alertas do backend
  async buscarAlertas() {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Buscar medicamentos
      const response = await api.get('/api/medicamentos', { headers });
      const produtos = response.data || [];

      const novosAlertas: Alerta[] = [];
      const hoje = new Date();

      for (const produto of produtos) {
        // 1. Produtos expirados
        if (produto.validade) {
          const validade = new Date(produto.validade);
          const diasRestantes = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diasRestantes < 0) {
            novosAlertas.push({
              id: `expirado_${produto.id}`,
              tipo: 'expirado',
              mensagem: `⚠️ Produto EXPIRADO: ${produto.nome}`,
              produto: produto.nome,
              gravidade: 'alta',
              data: new Date(),
              lida: false
            });
          } 
          // 2. Produtos quase expirar (30 dias)
          else if (diasRestantes <= 30) {
            novosAlertas.push({
              id: `quase_expirado_${produto.id}`,
              tipo: 'quase_expirado',
              mensagem: `⚠️ Produto VENCE EM ${diasRestantes} DIAS: ${produto.nome}`,
              produto: produto.nome,
              dias_restantes: diasRestantes,
              gravidade: diasRestantes <= 7 ? 'alta' : 'media',
              data: new Date(),
              lida: false
            });
          }
        }

        // 3. Estoque baixo
        const quantidade = produto.quantidade || produto.existences || 0;
        if (quantidade <= 10 && quantidade > 0) {
          novosAlertas.push({
            id: `estoque_baixo_${produto.id}`,
            tipo: 'estoque_baixo',
            mensagem: `📦 Estoque BAIXO: ${produto.nome} - apenas ${quantidade} unidades`,
            produto: produto.nome,
            quantidade: quantidade,
            gravidade: quantidade <= 5 ? 'alta' : 'media',
            data: new Date(),
            lida: false
          });
        } else if (quantidade === 0) {
          novosAlertas.push({
            id: `estoque_zerado_${produto.id}`,
            tipo: 'estoque_baixo',
            mensagem: `❌ Produto ESGOTADO: ${produto.nome}`,
            produto: produto.nome,
            quantidade: 0,
            gravidade: 'alta',
            data: new Date(),
            lida: false
          });
        }
      }

      // 4. Produtos com baixa rotatividade (buscar vendas)
      try {
        const vendasRes = await api.get('/api/vendas', { headers });
        const vendas = vendasRes.data || [];
        
        // Contar vendas por produto
        const vendasPorProduto = new Map<number, number>();
        vendas.forEach((venda: any) => {
          (venda.ItemVendas || []).forEach((item: any) => {
            const id = item.MedicamentoId;
            vendasPorProduto.set(id, (vendasPorProduto.get(id) || 0) + (item.quantidade || 0));
          });
        });

        for (const produto of produtos) {
          const totalVendido = vendasPorProduto.get(produto.id) || 0;
          if (totalVendido === 0) {
            novosAlertas.push({
              id: `baixa_rotatividade_${produto.id}`,
              tipo: 'baixa_rotatividade',
              mensagem: `📉 Produto SEM VENDAS: ${produto.nome} - nenhuma venda registrada`,
              produto: produto.nome,
              gravidade: 'media',
              data: new Date(),
              lida: false
            });
          }
        }
      } catch (error) {
        console.error('Erro ao buscar vendas para análise:', error);
      }

      // Remover duplicatas e ordenar por gravidade
      this.alertas = novosAlertas.filter((alerta, index, self) =>
        index === self.findIndex(a => a.id === alerta.id)
      ).sort((a, b) => {
        const gravidadeOrder = { alta: 0, media: 1, baixa: 2 };
        return gravidadeOrder[a.gravidade] - gravidadeOrder[b.gravidade];
      });

      this.notificar();
      return this.alertas;
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
      return [];
    }
  }

  // Iniciar verificação periódica (a cada 5 minutos)
  iniciarVerificacao() {
    if (this.intervalId) return;
    
    // Buscar imediatamente
    this.buscarAlertas();
    
    // Buscar a cada 5 minutos
    this.intervalId = setInterval(() => {
      this.buscarAlertas();
    }, 5 * 60 * 1000);
  }

  // Parar verificação
  pararVerificacao() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Marcar alerta como lido
  marcarComoLido(id: string) {
    const alerta = this.alertas.find(a => a.id === id);
    if (alerta) {
      alerta.lida = true;
      this.notificar();
    }
  }

  // Marcar todos como lidos
  marcarTodosLidos() {
    this.alertas.forEach(a => a.lida = true);
    this.notificar();
  }

  // Obter alertas não lidos
  getAlertasNaoLidos() {
    return this.alertas.filter(a => !a.lida);
  }

  // Obter total de alertas
  getTotalAlertas() {
    return this.alertas.length;
  }
}

export const alertService = new AlertService();