import { createServerClient } from "@/lib/supabase-server"
import { ProfileCustomizer } from "@/components/profile-customizer"
import { redirect } from "next/navigation"
import type { Profile, ProfileTheme } from "@/lib/types"

async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createServerClient()

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (!profile) return null

  return {
    ...profile,
    profile_widgets:
      typeof profile.profile_widgets === "string" ? JSON.parse(profile.profile_widgets) : profile.profile_widgets || [],
    social_links:
      typeof profile.social_links === "string" ? JSON.parse(profile.social_links) : profile.social_links || {},
  }
}

async function getThemes(): Promise<ProfileTheme[]> {
  const supabase = createServerClient()

  const { data: themes } = await supabase
    .from("profile_themes")
    .select("*")
    .order("downloads_count", { ascending: false })

  return themes || []
}

export default async function CustomizePage() {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  const profile = await getProfile(user.id)
  const themes = await getThemes()

  if (!profile) {
    redirect("/")
  }

  const handleSave = async (updates: Partial<Profile>) => {
    "use server"

    const supabase = createServerClient()

    const updateData = {
      ...updates,
      profile_widgets: JSON.stringify(updates.profile_widgets),
      social_links: JSON.stringify(updates.social_links),
      updated_at: new Date().toISOString(),
    }

    await supabase.from("profiles").update(updateData).eq("id", user.id)

    redirect("/profile/" + profile.username)
  }

  return (
    <div className="min-h-screen bg-background">
      <ProfileCustomizer profile={profile} themes={themes} onSave={handleSave} />
    </div>
  )
}
