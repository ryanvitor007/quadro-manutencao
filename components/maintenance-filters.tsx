"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Filter, CalendarIcon, Check, RotateCcw } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { Solicitacao, StatusSolicitacao, PrioridadeSolicitacao, TipoServico, DateRange } from "@/lib/data"
import { Label } from "@/components/ui/label"

export interface FilterState {
  setores: string[]
  maquinas: string[]
  operadores: string[]
  status: StatusSolicitacao[]
  prioridades: PrioridadeSolicitacao[]
  tiposServico: TipoServico[]
  dateRange: DateRange | undefined
}

interface MaintenanceFiltersProps {
  solicitacoes: Solicitacao[]
  onFilterChange: (filtered: Solicitacao[]) => void
  showEmployeeFilter?: boolean
}

export function MaintenanceFilters({
  solicitacoes,
  onFilterChange,
  showEmployeeFilter = true,
}: MaintenanceFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  // Opções dinâmicas baseadas nos dados
  const [opcoesSetores, setOpcoesSetores] = useState<string[]>([])
  const [opcoesMaquinas, setOpcoesMaquinas] = useState<string[]>([])
  const [opcoesOperadores, setOpcoesOperadores] = useState<string[]>([])
  const [opcoesTiposServico, setOpcoesTiposServico] = useState<TipoServico[]>([])

  // Estado dos filtros
  const [filtros, setFiltros] = useState<FilterState>({
    setores: [],
    maquinas: [],
    operadores: [],
    status: [],
    prioridades: [],
    tiposServico: [],
    dateRange: undefined,
  })

  // Extrair opções únicas quando os dados mudam
  useEffect(() => {
    const setores = Array.from(new Set(solicitacoes.map((s) => s.setor))).sort()
    const maquinas = Array.from(new Set(solicitacoes.map((s) => s.maquina))).sort()
    const operadores = Array.from(new Set(solicitacoes.map((s) => s.operadorNome))).sort()
    const tiposServico = Array.from(new Set(solicitacoes.map((s) => s.tipoServico || "Mecânica"))).sort()

    setOpcoesSetores(setores)
    setOpcoesMaquinas(maquinas)
    setOpcoesOperadores(operadores)
    setOpcoesTiposServico(tiposServico as TipoServico[])
  }, [solicitacoes])

  // Aplicar filtros
  const aplicarFiltros = () => {
    let filtradas = [...solicitacoes]

    // Filtro de Setor
    if (filtros.setores.length > 0) {
      filtradas = filtradas.filter((s) => filtros.setores.includes(s.setor))
    }

    // Filtro de Máquina
    if (filtros.maquinas.length > 0) {
      filtradas = filtradas.filter((s) => filtros.maquinas.includes(s.maquina))
    }

    // Filtro de Operador
    if (showEmployeeFilter && filtros.operadores.length > 0) {
      filtradas = filtradas.filter((s) => filtros.operadores.includes(s.operadorNome))
    }

    // Filtro de Status
    if (filtros.status.length > 0) {
      filtradas = filtradas.filter((s) => filtros.status.includes(s.status))
    }

    // Filtro de Prioridade
    if (filtros.prioridades.length > 0) {
      // Garantir que a prioridade existe ou tratar undefined como 'C' se necessário
      filtradas = filtradas.filter((s) => filtros.prioridades.includes(s.prioridade || "C"))
    }

    // Filtro de Tipo de Serviço
    if (filtros.tiposServico.length > 0) {
      filtradas = filtradas.filter((s) => filtros.tiposServico.includes(s.tipoServico || "Mecânica"))
    }

    // Filtro de Data
    if (filtros.dateRange?.from) {
      const from = new Date(filtros.dateRange.from)
      from.setHours(0, 0, 0, 0)

      const to = filtros.dateRange.to ? new Date(filtros.dateRange.to) : new Date(from)
      to.setHours(23, 59, 59, 999)

      filtradas = filtradas.filter((s) => {
        const dataCriacao = new Date(s.dataCriacao)
        return dataCriacao >= from && dataCriacao <= to
      })
    }

    // Contar filtros ativos
    let count = 0
    if (filtros.setores.length > 0) count++
    if (filtros.maquinas.length > 0) count++
    if (showEmployeeFilter && filtros.operadores.length > 0) count++
    if (filtros.status.length > 0) count++
    if (filtros.prioridades.length > 0) count++
    if (filtros.tiposServico.length > 0) count++
    if (filtros.dateRange?.from) count++

    setActiveFiltersCount(count)
    onFilterChange(filtradas)
    setIsOpen(false)
  }

  const limparFiltros = () => {
    const novosFiltros = {
      setores: [],
      maquinas: [],
      operadores: [],
      status: [],
      prioridades: [],
      tiposServico: [],
      dateRange: undefined,
    }
    setFiltros(novosFiltros)
    setActiveFiltersCount(0)
    onFilterChange(solicitacoes) // Reseta a lista para o original
    setIsOpen(false)
  }

  // Helpers para toggle de arrays
  const toggleFiltro = (campo: keyof FilterState, valor: any) => {
    setFiltros((prev) => {
      const arrayAtual = prev[campo] as any[]
      const novoArray = arrayAtual.includes(valor)
        ? arrayAtual.filter((item) => item !== valor)
        : [...arrayAtual, valor]
      return { ...prev, [campo]: novoArray }
    })
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 relative bg-transparent">
          <Filter className="size-4" />
          Filtrar
          {activeFiltersCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full overflow-hidden" side="right">
        <SheetHeader className="pb-4 pr-6">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Filter className="size-5" />
            Filtros
          </SheetTitle>
          <SheetDescription>Selecione as opções para refinar a lista de manutenções.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-8 py-4">
          <div className="space-y-6 pb-6">
            {/* Filtro de Status */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium leading-none">Status</h3>
              <div className="grid grid-cols-2 gap-2">
                {["pendente", "em_andamento", "concluida", "cancelada"].map((status) => (
                  <div
                    key={status}
                    className={cn(
                      "flex items-center space-x-2 border rounded-md p-2 cursor-pointer transition-colors hover:bg-muted",
                      filtros.status.includes(status as StatusSolicitacao) ? "bg-accent/10 border-accent" : "",
                    )}
                    onClick={() => toggleFiltro("status", status)}
                  >
                    <Checkbox checked={filtros.status.includes(status as StatusSolicitacao)} />
                    <Label className="cursor-pointer capitalize flex-1">{status.replace("_", " ")}</Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Filtro de Prioridade */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium leading-none">Prioridade</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "A", label: "Alta (A)" },
                  { id: "B", label: "Média (B)" },
                  { id: "C", label: "Baixa (C)" },
                ].map((prioridade) => (
                  <Badge
                    key={prioridade.id}
                    variant={
                      filtros.prioridades.includes(prioridade.id as PrioridadeSolicitacao) ? "default" : "outline"
                    }
                    className="cursor-pointer px-3 py-1.5 text-sm gap-2"
                    onClick={() => toggleFiltro("prioridades", prioridade.id)}
                  >
                    {filtros.prioridades.includes(prioridade.id as PrioridadeSolicitacao) && (
                      <Check className="size-3" />
                    )}
                    {prioridade.label}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Filtro de Data */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium leading-none">Período</h3>
              <div className="grid gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filtros.dateRange && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filtros.dateRange?.from ? (
                        filtros.dateRange.to ? (
                          <>
                            {format(filtros.dateRange.from, "dd/MM/yyyy")} -{" "}
                            {format(filtros.dateRange.to, "dd/MM/yyyy")}
                          </>
                        ) : (
                          format(filtros.dateRange.from, "dd/MM/yyyy")
                        )
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={filtros.dateRange?.from}
                      selected={filtros.dateRange}
                      onSelect={(range) => setFiltros((prev) => ({ ...prev, dateRange: range }))}
                      numberOfMonths={2}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Separator />

            {/* Filtro de Setor */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium leading-none">Setor</h3>
                <span className="text-xs text-muted-foreground">{filtros.setores.length} selecionados</span>
              </div>
              <div className="h-[120px] border rounded-md p-2 overflow-y-auto">
                <div className="space-y-2">
                  {opcoesSetores.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">Nenhum setor disponível</p>
                  ) : (
                    opcoesSetores.map((setor) => (
                      <div key={setor} className="flex items-center space-x-2">
                        <Checkbox
                          id={`setor-${setor}`}
                          checked={filtros.setores.includes(setor)}
                          onCheckedChange={() => toggleFiltro("setores", setor)}
                        />
                        <Label htmlFor={`setor-${setor}`} className="text-sm font-normal cursor-pointer w-full">
                          {setor}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Filtro de Máquina */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium leading-none">Máquina</h3>
                <span className="text-xs text-muted-foreground">{filtros.maquinas.length} selecionados</span>
              </div>
              <div className="h-[120px] border rounded-md p-2 overflow-y-auto">
                <div className="space-y-2">
                  {opcoesMaquinas.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">Nenhuma máquina disponível</p>
                  ) : (
                    opcoesMaquinas.map((maquina) => (
                      <div key={maquina} className="flex items-center space-x-2">
                        <Checkbox
                          id={`maquina-${maquina}`}
                          checked={filtros.maquinas.includes(maquina)}
                          onCheckedChange={() => toggleFiltro("maquinas", maquina)}
                        />
                        <Label htmlFor={`maquina-${maquina}`} className="text-sm font-normal cursor-pointer w-full">
                          {maquina}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Filtro de Operador (Apenas se showEmployeeFilter for true) */}
            {showEmployeeFilter && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium leading-none">Funcionário</h3>
                    <span className="text-xs text-muted-foreground">{filtros.operadores.length} selecionados</span>
                  </div>
                  <div className="h-[120px] border rounded-md p-2 overflow-y-auto">
                    <div className="space-y-2">
                      {opcoesOperadores.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">Nenhum operador disponível</p>
                      ) : (
                        opcoesOperadores.map((operador) => (
                          <div key={operador} className="flex items-center space-x-2">
                            <Checkbox
                              id={`operador-${operador}`}
                              checked={filtros.operadores.includes(operador)}
                              onCheckedChange={() => toggleFiltro("operadores", operador)}
                            />
                            <Label
                              htmlFor={`operador-${operador}`}
                              className="text-sm font-normal cursor-pointer w-full"
                            >
                              {operador}
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Filtro de Tipo de Serviço */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium leading-none">Tipo de Serviço</h3>
              <div className="flex flex-wrap gap-2">
                {opcoesTiposServico.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhum tipo disponível</p>
                ) : (
                  opcoesTiposServico.map((tipo) => (
                    <Badge
                      key={tipo}
                      variant={filtros.tiposServico.includes(tipo) ? "default" : "outline"}
                      className="cursor-pointer px-3 py-1.5 text-sm gap-2"
                      onClick={() => toggleFiltro("tiposServico", tipo)}
                    >
                      {filtros.tiposServico.includes(tipo) && <Check className="size-3" />}
                      {tipo}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="pt-4 border-t flex-col sm:flex-row gap-2">
          <Button variant="outline" className="w-full sm:w-auto bg-transparent" onClick={limparFiltros}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Limpar
          </Button>
          <Button className="w-full sm:w-1/2" onClick={aplicarFiltros}>
            Aplicar Filtros
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
