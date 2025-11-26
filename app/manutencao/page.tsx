"use client";

import { ApiService } from "@/lib/api.service";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  QrCode,
  AlertCircle,
  XCircle,
  Eye,
  AlertTriangle,
  Siren,
} from "lucide-react";
import Link from "next/link";
import {
  solicitacoesIniciais,
  type Solicitacao,
  type StatusSolicitacao,
  type PrioridadeSolicitacao,
} from "@/lib/data";
import { MaintenanceFilters } from "@/components/maintenance-filters"; // import new component

const statusConfig = {
  pendente: {
    label: "Pendente",
    icon: Clock,
    color: "bg-warning text-warning-foreground",
    borderColor: "border-warning",
  },
  em_andamento: {
    label: "Em Andamento",
    icon: AlertCircle,
    color: "bg-accent text-accent-foreground",
    borderColor: "border-accent",
  },
  concluida: {
    label: "Concluída",
    icon: CheckCircle2,
    color: "bg-success text-success-foreground",
    borderColor: "border-success",
  },
  cancelada: {
    label: "Cancelada",
    icon: XCircle,
    color: "bg-destructive text-destructive-foreground",
    borderColor: "border-destructive",
  },
};

const prioridadeConfig: Record<
  PrioridadeSolicitacao,
  { label: string; color: string; borderColor: string }
> = {
  A: {
    label: "Urgente",
    color: "text-destructive",
    borderColor: "border-destructive",
  },
  B: {
    label: "Média",
    color: "text-warning-foreground",
    borderColor: "border-warning",
  },
  C: {
    label: "Baixa",
    color: "text-primary",
    borderColor: "border-primary",
  },
};

export default function ManutencaoPage() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [solicitacoesExibidas, setSolicitacoesExibidas] = useState<
    Solicitacao[]
  >([]); // New state for filtered list
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] =
    useState<Solicitacao | null>(null);

  useEffect(() => {
    const carregarSolicitacoes = async () => {
      try {
        const dados = await ApiService.getAll();

        // O back-end retorna chaves em UPPERCASE ou snake_case dependendo do driver?
        // O seu service retorna camelCase pois fizemos o mapeamento manual no passo anterior?
        // Analisando seu service.ts, ele retorna raw do banco no getAll (SELECT *).
        // Firebird retorna colunas em MAIÚSCULAS por padrão (OPERADOR_ID, etc).
        // Precisamos normalizar isso aqui ou no back-end.
        // *DICA:* Vamos normalizar aqui para não quebrar o front existente.

        const dadosFormatados = dados.map((s: any) => ({
          id: s.ID,
          operadorId: s.OPERADOR_ID,
          operadorNome: s.OPERADOR_NOME,
          setor: s.SETOR,
          maquina: s.MAQUINA,
          descricao: s.DESCRICAO
            ? String(s.DESCRICAO)
            : s.descricao
            ? String(s.descricao)
            : "",
          status: s.STATUS || "pendente",
          prioridade: s.PRIORIDADE || "C",
          tipoServico: s.TIPO_SERVICO || "Mecânica",
          dataCriacao: s.DATA_CRIACAO,
          dataAtualizacao: s.DATA_ATUALIZACAO,
          observacoes: s.OBSERVACOES ? s.OBSERVACOES.toString() : "",
          criadoPorQr: s.criadoPorQr,
          responsavelTecnico: s.responsavelTecnico,
        }));

        setSolicitacoes(dadosFormatados);
        setSolicitacoesExibidas(dadosFormatados);
      } catch (error) {
        console.error("Falha ao carregar dados", error);
      }
    };

    carregarSolicitacoes();

    // Polling opcional para atualizar a cada 10 segundos
    const intervalo = setInterval(carregarSolicitacoes, 10000);
    return () => clearInterval(intervalo);
  }, []);

  const contadores = {
    pendente: solicitacoes.filter((s) => s.status === "pendente").length,
    em_andamento: solicitacoes.filter((s) => s.status === "em_andamento")
      .length,
    concluida: solicitacoes.filter((s) => s.status === "concluida").length,
  };

  // Atualiza o status de uma solicitação
  const atualizarStatus = async (id: string, novoStatus: StatusSolicitacao) => {
    // Atualização Otimista (atualiza na tela antes de confirmar no banco para ser rápido)
    const backupSolicitacoes = [...solicitacoes];

    const atualizadas = solicitacoes.map((s) =>
      s.id === id
        ? {
            ...s,
            status: novoStatus,
            dataAtualizacao: new Date().toISOString(),
          }
        : s
    );
    setSolicitacoes(atualizadas);
    setSolicitacoesExibidas(atualizadas); // Atualiza filtro atual também

    try {
      await ApiService.update(id, { status: novoStatus });
      // Sucesso silencioso
    } catch (error) {
      alert("Erro ao atualizar no banco de dados.");
      // Reverte em caso de erro
      setSolicitacoes(backupSolicitacoes);
      setSolicitacoesExibidas(backupSolicitacoes);
    }
  };

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO);
    const agora = new Date();
    const diffMs = agora.getTime() - data.getTime();
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutos = Math.floor(diffMs / (1000 * 60));

    if (diffMinutos < 60) {
      return `${diffMinutos} min atrás`;
    } else if (diffHoras < 24) {
      return `${diffHoras}h atrás`;
    } else {
      return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  // Helper to safely get priority config
  const getPrioridadeConfig = (prioridade: PrioridadeSolicitacao) => {
    return prioridadeConfig[prioridade] || prioridadeConfig["C"];
  };

  // Detalhe da solicitação selecionada
  if (solicitacaoSelecionada) {
    const StatusIcon = statusConfig[solicitacaoSelecionada.status].icon;
    // Use safe config getter
    const pConfig = getPrioridadeConfig(solicitacaoSelecionada.prioridade);

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setSolicitacaoSelecionada(null)}
            >
              <ArrowLeft className="size-4" />
              Voltar para Lista
            </Button>
          </div>

          <Card
            className={`border-2 ${
              statusConfig[solicitacaoSelecionada.status].borderColor
            }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-2xl">
                      Solicitação #{solicitacaoSelecionada.id}
                    </CardTitle>
                    {solicitacaoSelecionada.prioridade === "A" ? (
                      <Badge
                        variant="destructive"
                        className="animate-pulse gap-1 px-3"
                      >
                        <AlertTriangle className="size-3.5" />
                        Prioridade A
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        // Use pConfig instead of direct lookup to prevent crash
                        className={`font-bold ${pConfig.color} ${pConfig.borderColor}`}
                      >
                        Prioridade {solicitacaoSelecionada.prioridade || "C"}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-base">
                    {formatarData(solicitacaoSelecionada.dataCriacao)}
                  </CardDescription>
                </div>
                <Badge
                  className={`${
                    statusConfig[solicitacaoSelecionada.status].color
                  } gap-2 px-3 py-1.5 text-sm`}
                >
                  <StatusIcon className="size-4" />
                  {statusConfig[solicitacaoSelecionada.status].label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Operador</p>
                  <p className="text-base font-semibold">
                    {solicitacaoSelecionada.operadorNome}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Setor</p>
                  <p className="text-base font-semibold">
                    {solicitacaoSelecionada.setor}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Máquina</p>
                  <p className="text-base font-semibold">
                    {solicitacaoSelecionada.maquina}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Tipo de Serviço
                  </p>
                  <p className="text-base font-semibold">
                    {solicitacaoSelecionada.tipoServico || "Mecânica"}
                  </p>
                </div>
                {solicitacaoSelecionada.dataAtualizacao && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Última Atualização
                    </p>
                    <p className="text-base font-semibold">
                      {formatarData(solicitacaoSelecionada.dataAtualizacao)}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Descrição do Problema
                </p>
                <div className="p-4 bg-secondary/50 rounded-lg border">
                  <p className="text-base leading-relaxed">
                    {solicitacaoSelecionada.descricao}
                  </p>
                </div>
              </div>

              {solicitacaoSelecionada.observacoes && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Observações da Manutenção
                  </p>
                  <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                    <p className="text-base leading-relaxed">
                      {solicitacaoSelecionada.observacoes}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-4 border-t">
                <p className="text-sm font-semibold text-muted-foreground">
                  Atualizar Status
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    variant={
                      solicitacaoSelecionada.status === "pendente"
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      atualizarStatus(solicitacaoSelecionada.id, "pendente")
                    }
                    className="gap-2"
                  >
                    <Clock className="size-4" />
                    Pendente
                  </Button>
                  <Button
                    variant={
                      solicitacaoSelecionada.status === "em_andamento"
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      atualizarStatus(solicitacaoSelecionada.id, "em_andamento")
                    }
                    className="gap-2"
                  >
                    <AlertCircle className="size-4" />
                    Em Andamento
                  </Button>
                  <Button
                    variant={
                      solicitacaoSelecionada.status === "concluida"
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      atualizarStatus(solicitacaoSelecionada.id, "concluida")
                    }
                    className="gap-2"
                  >
                    <CheckCircle2 className="size-4" />
                    Concluída
                  </Button>
                  <Button
                    variant={
                      solicitacaoSelecionada.status === "cancelada"
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      atualizarStatus(solicitacaoSelecionada.id, "cancelada")
                    }
                    className="gap-2"
                  >
                    <XCircle className="size-4" />
                    Cancelada
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="size-4" />
              Voltar
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dashboard de Manutenção
          </h1>
          <p className="text-muted-foreground">
            Gerencie todas as solicitações de manutenção
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="border-2 border-warning/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Pendentes
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {contadores.pendente}
                  </p>
                </div>
                <div className="size-12 rounded-full bg-warning/10 flex items-center justify-center">
                  <Clock className="size-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Em Andamento
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {contadores.em_andamento}
                  </p>
                </div>
                <div className="size-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <AlertCircle className="size-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-success/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Concluídas
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {contadores.concluida}
                  </p>
                </div>
                <div className="size-12 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="size-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Solicitações</CardTitle>
                <CardDescription>
                  {solicitacoesExibidas.length} solicitação(ões) encontrada(s)
                </CardDescription>
              </div>
              <div className="flex gap-2 flex-wrap">
                <MaintenanceFilters
                  solicitacoes={solicitacoes}
                  onFilterChange={setSolicitacoesExibidas}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {solicitacoesExibidas.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Nenhuma solicitação encontrada
                  </p>
                </div>
              ) : (
                solicitacoesExibidas.map((solicitacao) => {
                  const StatusIcon = statusConfig[solicitacao.status].icon;

                  return (
                    <div
                      key={solicitacao.id}
                      className={`p-4 rounded-lg border-2 ${
                        statusConfig[solicitacao.status].borderColor
                      } bg-card hover:shadow-md transition-all cursor-pointer`}
                      onClick={() => setSolicitacaoSelecionada(solicitacao)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <Badge
                              className={`${
                                statusConfig[solicitacao.status].color
                              } gap-1.5 shrink-0`}
                            >
                              <StatusIcon className="size-3.5" />
                              {statusConfig[solicitacao.status].label}
                            </Badge>

                            {solicitacao.prioridade === "A" && (
                              <Badge
                                variant="destructive"
                                className="gap-1 animate-pulse shadow-sm shadow-destructive/20"
                              >
                                <Siren className="size-3" />
                                URGENTE
                              </Badge>
                            )}
                            {solicitacao.prioridade !== "A" && (
                              // Use safe config getter and fallback for undefined priority
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  getPrioridadeConfig(solicitacao.prioridade)
                                    .color
                                } border-${
                                  getPrioridadeConfig(
                                    solicitacao.prioridade
                                  ).borderColor.split("-")[1]
                                }/30`}
                              >
                                Prioridade {solicitacao.prioridade || "C"}
                              </Badge>
                            )}

                            <span className="text-sm text-muted-foreground">
                              {formatarData(solicitacao.dataCriacao)}
                            </span>
                          </div>
                          {/* Título da Máquina + Ícone QR */}
                          <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                            {solicitacao.maquina} - {solicitacao.setor}
                            {/* Se foi criado por QR, mostra o ícone */}
                            {solicitacao.criadoPorQr && (
                              <div
                                title="Solicitado via Leitura de QR Code"
                                className="bg-blue-100 text-blue-600 p-1 rounded-md"
                              >
                                <QrCode className="size-4" />
                              </div>
                            )}
                          </h3>

                          {/* Lógica dos Nomes: Operador vs Responsável Técnico */}
                          {solicitacao.criadoPorQr ? (
                            <div className="mb-2 text-sm bg-blue-50/50 p-2 rounded border border-blue-100/50">
                              <p className="text-muted-foreground">
                                Solicitante:{" "}
                                <span className="font-medium text-foreground">
                                  {solicitacao.operadorNome}
                                </span>
                              </p>
                              <p className="text-muted-foreground mt-0.5">
                                Responsável Técnico:{" "}
                                <span className="font-medium text-blue-700">
                                  {solicitacao.responsavelTecnico || "N/D"}
                                </span>
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground mb-2">
                              Operador: {solicitacao.operadorNome}
                            </p>
                          )}
                          <p className="text-sm text-foreground line-clamp-2">
                            {solicitacao.descricao}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                        >
                          <Eye className="size-5" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
