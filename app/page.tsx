"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wrench, ClipboardList, User, Lock, AlertCircle } from "lucide-react"
import { operadores, encarregados } from "@/lib/data"
import { ApiService } from "@/lib/api.service";

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Estados para login de Operador
  const [matriculaOperador, setMatriculaOperador] = useState("")

  // Estados para login de Encarregado
  const [usuarioEncarregado, setUsuarioEncarregado] = useState("")
  const [senhaEncarregado, setSenhaEncarregado] = useState("")


  // Handlers de Login OPERADOR e ENCARREGADO
  const handleLoginOperador = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Chama a API real
      const resultado = await ApiService.login('operador', matriculaOperador)
      
      if (resultado.ok && resultado.user) {
        const user = resultado.user;
        // Salva no localStorage para a sessão (mapeando campos do banco)
        localStorage.setItem("userType", "operador")
        localStorage.setItem("userId", user.LOGIN_MATRICULA || user.ID) // Ou use o ID do banco
        localStorage.setItem("userName", user.NOME)
        
        // Redireciona
        router.push("/operador")
      } else {
        setError("Matrícula não encontrada.")
      }
    } catch (err) {
      setError("Erro de conexão ou matrícula inválida.")
    } finally {
      setLoading(false)
    }
  }

  const handleLoginEncarregado = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Chama a API real com senha
      const resultado = await ApiService.login('encarregado', usuarioEncarregado, senhaEncarregado)

      if (resultado.ok && resultado.user) {
        const user = resultado.user;
        localStorage.setItem("userType", "manutencao") // Note que aqui usamos 'manutencao' no front antigo
        localStorage.setItem("userId", user.ID)
        localStorage.setItem("userName", user.NOME)
        
        router.push("/manutencao")
      } else {
        setError("Usuário ou senha incorretos.")
      }
    } catch (err) {
      setError("Erro ao tentar login.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Quadro de Manutenção</h1>
          <p className="text-muted-foreground">Fundaluminio - Acesso ao Sistema</p>
        </div>

        <Tabs defaultValue="operador" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 h-14">
            <TabsTrigger
              value="operador"
              className="text-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Operador
            </TabsTrigger>
            <TabsTrigger
              value="encarregado"
              className="text-lg data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              Encarregado
            </TabsTrigger>
          </TabsList>

          <TabsContent value="operador">
            <Card className="border-2 border-primary/20 shadow-lg">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                  <Wrench className="size-5 sm:size-6 text-primary shrink-0" />
                  Acesso Operador
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Digite sua matrícula para acessar o painel de solicitações.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLoginOperador}>
                <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
                  <div className="space-y-2">
                    <Label htmlFor="matricula">Matrícula</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <Input
                        id="matricula"
                        placeholder="Ex: 1234"
                        className="pl-9 text-lg h-12"
                        value={matriculaOperador}
                        onChange={(e) => setMatriculaOperador(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                      <AlertCircle className="size-4" />
                      {error}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-2">
                  <Button type="submit" className="w-full h-12 text-lg font-semibold" disabled={loading}>
                    {loading ? "Entrando..." : "Acessar Sistema"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="encarregado">
            <Card className="border-2 border-accent/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <ClipboardList className="size-6 text-accent" />
                  Acesso Encarregado
                </CardTitle>
                <CardDescription>Área restrita para gestão de manutenção.</CardDescription>
              </CardHeader>
              <form onSubmit={handleLoginEncarregado}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="usuario">Usuário</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <Input
                        id="usuario"
                        placeholder="usuario.sistema"
                        className="pl-9 h-12"
                        value={usuarioEncarregado}
                        onChange={(e) => setUsuarioEncarregado(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senha">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <Input
                        id="senha"
                        type="password"
                        placeholder="••••••"
                        className="pl-9 h-12"
                        value={senhaEncarregado}
                        onChange={(e) => setSenhaEncarregado(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                      <AlertCircle className="size-4" />
                      {error}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-12 text-lg font-semibold bg-accent text-accent-foreground hover:bg-accent/90"
                    disabled={loading}
                  >
                    {loading ? "Verificando..." : "Entrar no Painel"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">Fundaluminio © 2025 - Sistema de Controle Industrial</p>
        </div>
      </div>
    </div>
  )
}
