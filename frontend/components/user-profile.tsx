import { useAuth } from "@/components/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function UserProfile() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="flex items-center gap-2">
      <Avatar>
        <AvatarImage src={user.user_metadata?.avatar_url} />
        <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <span className="text-sm">{user.email}</span>
    </div>
  )
} 