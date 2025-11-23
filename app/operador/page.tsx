"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  CheckCircle2,
  Wrench,
  Bell,
  Clock,
  AlertCircle,
  QrCode,
  ScanLine,
  RefreshCw,
  AlertTriangle,
  Info,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  operadores,
  type Solicitacao,
  solicitacoesIniciais,
  type PrioridadeSolicitacao,
  type TipoServico,
} from "@/lib/data"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MaintenanceFilters } from "@/components/maintenance-filters"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function OperadorPage() {
  const router = useRouter()
  const [operadorSelecionado, setOperadorSelecionado] = useState<string>("")
  const [descricao, setDescricao] = useState("")
  const [prioridade, setPrioridade] = useState<PrioridadeSolicitacao>("B")
  const [tipoServico, setTipoServico] = useState<TipoServico>("Mecânica")
  const [solicitacaoEnviada, setSolicitacaoEnviada] = useState(false)
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
  const [solicitacoesExibidas, setSolicitacoesExibidas] = useState<Solicitacao[]>([])
  const [notificacoes, setNotificacoes] = useState<Solicitacao[]>([])
  const [isMinhaMaquina, setIsMinhaMaquina] = useState(true)
  const [maquinaAtual, setMaquinaAtual] = useState({ nome: "", setor: "" })
  const [scanning, setScanning] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleToggleMaquina = (checked: boolean) => {
    setIsMinhaMaquina(checked)
  }

  const handleScanQRCode = () => {
    setScanning(true)
    // Simulate QR code scanning
    setTimeout(() => {
      setScanning(false)
      setMaquinaAtual({ nome: "Maquina1", setor: "Setor1" }) // Example QR code result
    }, 2000)
  }

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    const userType = localStorage.getItem("userType")

    if (!userId || userType !== "operador") {
      router.push("/")
      return
    }

    setOperadorSelecionado(userId)
    setIsLoading(false)
  }, [router])

  const operadorAtual = operadores.find((op) => op.id === operadorSelecionado)

  useEffect(() => {
    if (operadorAtual && isMinhaMaquina) {
      setMaquinaAtual({ nome: operadorAtual.maquina, setor: operadorAtual.setor })
    }
  }, [operadorAtual, isMinhaMaquina])

  useEffect(() => {
    const carregarDados = () => {
      if (!operadorSelecionado) {
        setSolicitacoes([])
        setSolicitacoesExibidas([])
        setNotificacoes([])
        return
      }

      const storedData = localStorage.getItem("solicitacoes")
      const todasSolicitacoes: Solicitacao[] = storedData ? JSON.parse(storedData) : solicitacoesIniciais

      const solicitacoesComTipo = todasSolicitacoes.map((s) => ({
        ...s,
        tipoServico: s.tipoServico || "Mecânica",
      }))

      const minhasSolicitacoes = solicitacoesComTipo
        .filter((s) => s.operadorId === operadorSelecionado)
        .sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime())

      setSolicitacoes(minhasSolicitacoes)

      if (solicitacoesExibidas.length === 0 && minhasSolicitacoes.length > 0) {
        setSolicitacoesExibidas(minhasSolicitacoes)
      }

      const novasNotificacoes = minhasSolicitacoes.filter((s) => s.status === "concluida")
      setNotificacoes(novasNotificacoes)
    }

    carregarDados()
    const interval = setInterval(carregarDados, 2000)

    return () => clearInterval(interval)
  }, [operadorSelecionado])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendente":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25 border-yellow-200"
          >
            Pendente
          </Badge>
        )
      case "em_andamento":
        return (
          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
            Em Andamento
          </Badge>
        )
      case "concluida":
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            Concluída
          </Badge>
        )
      case "cancelada":
        return <Badge variant="destructive">Cancelada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!operadorSelecionado || !descricao.trim() || !maquinaAtual.nome) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    setIsSubmitting(true)

    setTimeout(() => {
      const novaSolicitacao: Solicitacao = {
        id: Date.now().toString(),
        operadorId: operadorSelecionado,
        operadorNome: operadorAtual?.nome || "",
        setor: maquinaAtual.setor,
        maquina: maquinaAtual.nome,
        descricao: descricao,
        status: "pendente",
        prioridade: prioridade,
        tipoServico: tipoServico,
        dataCriacao: new Date().toISOString(),
      }

      const solicitacoesExistentes = JSON.parse(localStorage.getItem("solicitacoes") || "[]")
      const novasSolicitacoes = [...solicitacoesExistentes, novaSolicitacao]

      if (!localStorage.getItem("solicitacoes")) {
        novasSolicitacoes.push(...solicitacoesIniciais)
      }

      localStorage.setItem("solicitacoes", JSON.stringify(novasSolicitacoes))

      setSolicitacaoEnviada(true)
      setIsSubmitting(false)

      setTimeout(() => {
        setSolicitacaoEnviada(false)
        setDescricao("")
        setPrioridade("B")
        setTipoServico("Mecânica")
        setIsMinhaMaquina(true)
        if (operadorAtual) {
          setMaquinaAtual({ nome: operadorAtual.maquina, setor: operadorAtual.setor })
        }
      }, 3000)
    }, 1500) // 1.5 second delay to simulate submission
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="text-center">
          <RefreshCw className="size-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!operadorAtual) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <AlertCircle className="size-12 text-destructive mx-auto mb-4" />
            <p className="text-center text-muted-foreground">
              Operador não encontrado. Por favor, faça login novamente.
            </p>
            <Button className="w-full mt-4" onClick={() => router.push("/")}>
              Voltar para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="size-4" />
              Sair
            </Button>
          </Link>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {operadorAtual.nome.charAt(0)}
            </div>
            <span className="font-medium">{operadorAtual.nome}</span>
          </div>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Wrench className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Solicitar Manutenção</h1>
            <p className="text-muted-foreground">Preencha os dados para solicitar manutenção</p>
          </div>
        </div>

        {operadorSelecionado && notificacoes.length > 0 && (
          <Alert className="mb-6 border-green-500/50 bg-green-500/10">
            <Bell className="size-4 text-green-600" />
            <AlertTitle className="text-green-700 font-bold flex items-center gap-2">Manutenção Concluída!</AlertTitle>
            <AlertDescription className="text-green-700">
              Você tem {notificacoes.length} solicitação(ões) marcada(s) como concluída(s).
              <div className="mt-2 text-xs font-medium">
                Última: {notificacoes[0].maquina} -{" "}
                {new Date(notificacoes[0].dataAtualizacao || notificacoes[0].dataCriacao).toLocaleDateString()}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Nova Solicitação</CardTitle>
            <CardDescription>Informe o problema encontrado na máquina</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="p-4 bg-secondary/30 rounded-lg border space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Você é operador desta máquina?</Label>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${!isMinhaMaquina ? "font-bold text-primary" : "text-muted-foreground"}`}>
                      Não
                    </span>
                    <Switch checked={isMinhaMaquina} onCheckedChange={handleToggleMaquina} />
                    <span className={`text-sm ${isMinhaMaquina ? "font-bold text-primary" : "text-muted-foreground"}`}>
                      Sim
                    </span>
                  </div>
                </div>

                {isMinhaMaquina ? (
                  <div className="grid md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <Label className="text-sm text-muted-foreground">Setor</Label>
                      <p className="text-lg font-semibold mt-1">{operadorAtual.setor}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Máquina</Label>
                      <p className="text-lg font-semibold mt-1">{operadorAtual.maquina}</p>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 space-y-4">
                    {!maquinaAtual.nome ? (
                      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-background">
                        <QrCode className="size-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4 text-center">
                          Escaneie o QR Code da máquina para identificar
                        </p>
                        <Button type="button" onClick={handleScanQRCode} disabled={scanning} className="gap-2">
                          {scanning ? (
                            <>
                              <RefreshCw className="size-4 animate-spin" />
                              Lendo QR Code...
                            </>
                          ) : (
                            <>
                              <ScanLine className="size-4" />
                              Ler QR Code da Máquina
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between bg-green-500/10 p-3 rounded border border-green-500/20">
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle2 className="size-5" />
                            <span className="font-medium">Máquina Identificada</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setMaquinaAtual({ nome: "", setor: "" })}
                            className="text-xs h-8"
                          >
                            Escanear Outra
                          </Button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm text-muted-foreground">Setor Identificado</Label>
                            <p className="text-lg font-semibold mt-1">{maquinaAtual.setor}</p>
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">Máquina Identificada</Label>
                            <p className="text-lg font-semibold mt-1">{maquinaAtual.nome}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Prioridade da Manutenção *</Label>
                <div className="p-4 bg-background border rounded-lg">
                  <RadioGroup
                    value={prioridade}
                    onValueChange={(value) => setPrioridade(value as PrioridadeSolicitacao)}
                    className="grid gap-4"
                  >
                    <div className="flex items-center space-x-3 p-3 rounded-md border-2 border-transparent hover:bg-secondary/50 transition-colors has-[:checked]:border-destructive/50 has-[:checked]:bg-destructive/5">
                      <RadioGroupItem
                        value="A"
                        id="prioridade-a"
                        className="text-destructive border-destructive shrink-0"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="prioridade-a"
                          className="font-bold flex flex-wrap items-center gap-2 text-destructive cursor-pointer"
                        >
                          <AlertTriangle className="size-5 fill-destructive/20 shrink-0" />
                          <span>Prioridade A - URGENTE</span>
                        </Label>
                        <p className="text-sm text-muted-foreground pl-7 mt-1">
                          Parada de máquina, risco de segurança ou qualidade.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 rounded-md border-2 border-transparent hover:bg-secondary/50 transition-colors has-[:checked]:border-warning/50 has-[:checked]:bg-warning/5">
                      <RadioGroupItem value="B" id="prioridade-b" className="text-warning border-warning shrink-0" />
                      <div className="flex-1">
                        <Label
                          htmlFor="prioridade-b"
                          className="font-bold flex flex-wrap items-center gap-2 text-warning-foreground cursor-pointer"
                        >
                          <AlertCircle className="size-5 shrink-0" />
                          <span>Prioridade B - MÉDIA URGÊNCIA</span>
                        </Label>
                        <p className="text-sm text-muted-foreground pl-7 mt-1">
                          Falha parcial, redução de desempenho, mas opera.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 rounded-md border-2 border-transparent hover:bg-secondary/50 transition-colors has-[:checked]:border-primary/50 has-[:checked]:bg-primary/5">
                      <RadioGroupItem value="C" id="prioridade-c" className="text-primary border-primary shrink-0" />
                      <div className="flex-1">
                        <Label
                          htmlFor="prioridade-c"
                          className="font-bold flex flex-wrap items-center gap-2 text-primary cursor-pointer"
                        >
                          <Info className="size-5 shrink-0" />
                          <span>Prioridade C - BAIXA URGÊNCIA</span>
                        </Label>
                        <p className="text-sm text-muted-foreground pl-7 mt-1">
                          Melhorias, estética, pequenos reparos agendáveis.
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Tipo de Serviço *</Label>
                <Select value={tipoServico} onValueChange={(value) => setTipoServico(value as TipoServico)}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Selecione o tipo de serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mecânica">
                      <div className="flex items-center gap-2">
                        <Wrench className="size-4" />
                        Manutenção Mecânica
                      </div>
                    </SelectItem>
                    <SelectItem value="Elétrica">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="size-4" />
                        Manutenção Elétrica
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Selecione se o problema é mecânico (peças, rolamentos, etc.) ou elétrico (motores, sensores, etc.)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao" className="text-base font-semibold">
                  Descrição do Problema *
                </Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva o problema encontrado na máquina..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="min-h-32 text-base resize-none"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Seja o mais específico possível para agilizar o atendimento
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  size="lg"
                  className="flex-1 text-base font-semibold h-12 transition-all duration-300"
                  disabled={!operadorSelecionado || !descricao.trim() || !maquinaAtual.nome || isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2 animate-in fade-in duration-300">
                      <RefreshCw className="size-4 animate-spin" />
                      <span>Enviando...</span>
                    </div>
                  ) : (
                    <span className="animate-in fade-in duration-300">Enviar Solicitação</span>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="text-base h-12 bg-transparent"
                  onClick={() => {
                    setDescricao("")
                    setPrioridade("B")
                    setTipoServico("Mecânica")
                    setIsMinhaMaquina(true)
                    if (operadorAtual) {
                      setMaquinaAtual({ nome: operadorAtual.maquina, setor: operadorAtual.setor })
                    }
                  }}
                  disabled={isSubmitting}
                >
                  Limpar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Dica:</strong> Em caso de emergência ou risco à segurança, contate
            imediatamente o supervisor ou a equipe de segurança.
          </p>
        </div>

        {operadorSelecionado && (
          <div className="mt-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Clock className="size-6" />
                Histórico de Solicitações
              </h2>
              <MaintenanceFilters
                solicitacoes={solicitacoes}
                onFilterChange={setSolicitacoesExibidas}
                showEmployeeFilter={false}
              />
            </div>
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Máquina</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {solicitacoesExibidas.length > 0 ? (
                      solicitacoesExibidas.map((solicitacao) => (
                        <TableRow key={solicitacao.id}>
                          <TableCell className="font-medium">
                            {new Date(solicitacao.dataCriacao).toLocaleDateString()}
                            <div className="text-xs text-muted-foreground">
                              {new Date(solicitacao.dataCriacao).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>{solicitacao.maquina}</div>
                            <Badge
                              variant="outline"
                              className={`mt-1 text-[10px] uppercase font-bold border-2
                              ${
                                solicitacao.prioridade === "A"
                                  ? "text-destructive border-destructive/30 bg-destructive/5"
                                  : solicitacao.prioridade === "B"
                                    ? "text-warning-foreground border-warning/30 bg-warning/5"
                                    : "text-primary border-primary/30 bg-primary/5"
                              }`}
                            >
                              Prioridade {solicitacao.prioridade}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <div className="truncate" title={solicitacao.descricao}>
                              {solicitacao.descricao}
                            </div>
                            {solicitacao.observacoes && (
                              <div
                                className="text-xs text-muted-foreground mt-1 truncate"
                                title={solicitacao.observacoes}
                              >
                                Obs: {solicitacao.observacoes}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(solicitacao.status)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                          Nenhuma solicitação encontrada no histórico.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
