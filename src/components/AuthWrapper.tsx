import { Button } from './ui/button'
import { MessageSquare, Users, Zap } from 'lucide-react'
import { blink } from '../blink/client'

export function AuthWrapper() {
  const handleSignIn = () => {
    blink.auth.login()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Team Collaborative AI Chat
          </h1>
          <p className="text-muted-foreground text-lg">
            Work together with AI to solve problems, brainstorm ideas, and boost your team's productivity.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 text-left">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-card border">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-medium">Team Collaboration</h3>
                <p className="text-sm text-muted-foreground">Share AI conversations with your team</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-card border">
              <MessageSquare className="w-5 h-5 text-accent" />
              <div>
                <h3 className="font-medium">Smart Conversations</h3>
                <p className="text-sm text-muted-foreground">AI-powered chat with context awareness</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-card border">
              <Zap className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-medium">Real-time Updates</h3>
                <p className="text-sm text-muted-foreground">See team activity and responses instantly</p>
              </div>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleSignIn}
          size="lg"
          className="w-full"
        >
          Sign In to Get Started
        </Button>

        <p className="text-xs text-muted-foreground">
          By signing in, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  )
}