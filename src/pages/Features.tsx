import { 
  Zap, 
  Brain, 
  Shield, 
  Code, 
  BarChart3, 
  Globe, 
  Lock, 
  Sparkles,
  MessageSquare,
  Settings,
  TrendingUp,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Features() {
  const mainFeatures = [
    {
      icon: Brain,
      title: "Advanced AI Engine",
      description: "Powered by state-of-the-art machine learning models that understand context, learn from interactions, and adapt to your specific needs."
    },
    {
      icon: Zap,
      title: "Lightning Fast Performance",
      description: "Built for speed with optimized processing pipelines that deliver instant responses, even under heavy load."
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption, compliance with industry standards, and comprehensive security features to protect your data."
    },
    {
      icon: Code,
      title: "Developer Friendly",
      description: "Clean APIs, comprehensive documentation, and extensive SDK support for seamless integration into your workflow."
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Real-time analytics and detailed insights to help you understand bot performance and optimize interactions."
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Support for 50+ languages out of the box, with automatic language detection and translation capabilities."
    }
  ]

  const additionalFeatures = [
    {
      icon: Lock,
      title: "Data Privacy",
      description: "Your data stays yours. We never share or sell your information."
    },
    {
      icon: MessageSquare,
      title: "Multi-Channel",
      description: "Deploy bots across web, mobile, messaging platforms, and more."
    },
    {
      icon: Settings,
      title: "Easy Configuration",
      description: "Intuitive dashboard and configuration tools for quick setup."
    },
    {
      icon: TrendingUp,
      title: "Scalable Infrastructure",
      description: "Automatically scales to handle millions of interactions seamlessly."
    },
    {
      icon: Sparkles,
      title: "Custom Integrations",
      description: "Connect with your favorite tools and services via our extensive API."
    },
    {
      icon: CheckCircle2,
      title: "99.9% Uptime",
      description: "Reliable infrastructure with guaranteed uptime and 24/7 monitoring."
    }
  ]

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/50 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              Powerful Features
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Everything You Need to
            <span className="block mt-2 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Build Intelligent Bots
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive features designed to help you create, deploy, and scale 
            AI-powered bots with ease.
          </p>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Core Features
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The essential tools and capabilities that power every BotAI bot
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div 
                  key={index}
                  className="p-6 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors group"
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Additional Capabilities
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Even more features to enhance your bot-building experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div 
                  key={index}
                  className="p-6 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Built for Scale, Designed for Simplicity
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                Whether you're building a simple chatbot or a complex enterprise automation 
                system, BotAI provides the tools and infrastructure you need to succeed.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">No-code and code-first options</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Real-time monitoring and debugging</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">A/B testing and optimization tools</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Comprehensive documentation and support</span>
                </li>
              </ul>
              <Button size="lg" className="group">
                Explore Documentation
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            <div className="p-8 rounded-2xl border border-border bg-gradient-to-br from-card to-card/50">
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Performance</span>
                    <span className="text-sm font-bold text-primary">99.9%</span>
                  </div>
                  <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '99.9%' }}></div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Uptime</span>
                    <span className="text-sm font-bold text-primary">99.9%</span>
                  </div>
                  <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '99.9%' }}></div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Customer Satisfaction</span>
                    <span className="text-sm font-bold text-primary">4.9/5</span>
                  </div>
                  <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '98%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

