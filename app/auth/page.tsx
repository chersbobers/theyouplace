import { getUser } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { AuthForm } from "@/components/auth-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AuthPage() {
  const user = await getUser()

  if (user) {
    redirect("/")
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Join The You Place</CardTitle>
          <p className="text-gray-600">Where social media lives</p>
        </CardHeader>
        <CardContent>
          <AuthForm />
        </CardContent>
      </Card>
    </div>
  )
}
