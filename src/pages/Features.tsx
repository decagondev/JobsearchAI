import { useNavigate } from "react-router-dom"
import { 
  FileText, 
  Target, 
  Briefcase, 
  MessageSquare, 
  Sparkles,
  Zap,
  Shield,
  CheckCircle2,
  Brain,
  TrendingUp,
  Lock,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function Features() {
  const navigate = useNavigate()

  const mainFeatures = [
    {
      icon: FileText,
      title: "Smart Resume Analysis",
      description: "Upload your resume in PDF or text format, and our AI automatically extracts your skills, experience, education, and qualifications to build a comprehensive profile."
    },
    {
      icon: Target,
      title: "AI-Powered Job Matching",
      description: "Advanced algorithms search the web for relevant opportunities and match them to your profile using vector similarity and semantic understanding."
    },
    {
      icon: Briefcase,
      title: "Personalized Prep Tasks",
      description: "Receive tailored preparation tasks, interview tips, and insights for each job opportunity to help you prepare effectively and stand out."
    },
    {
      icon: MessageSquare,
      title: "AI Career Assistant",
      description: "Chat with our AI assistant to get answers about jobs, practice interview questions, receive career advice, and get help with your job search."
    },
    {
      icon: Brain,
      title: "Skills Extraction",
      description: "Automatically identify and extract technical skills, soft skills, and experience from your resume using advanced natural language processing."
    },
    {
      icon: Zap,
      title: "Fast & Efficient",
      description: "Get job matches and preparation tasks in minutes, not hours. Our optimized pipeline delivers results quickly so you can focus on applying."
    }
  ]

  const additionalFeatures = [
    {
      icon: Lock,
      title: "Privacy First",
      description: "Your resume and data stay on your device. We never share or sell your personal information. Your privacy is our priority."
    },
    {
      icon: Shield,
      title: "Secure Processing",
      description: "All data processing happens securely with industry-standard encryption. Your information is protected throughout the entire process."
    },
    {
      icon: TrendingUp,
      title: "Job Ranking",
      description: "Jobs are ranked by relevance to your profile, making it easy to identify the best opportunities for you."
    },
    {
      icon: CheckCircle2,
      title: "Preparation Checklists",
      description: "Track your preparation progress with interactive checklists for each job opportunity, helping you stay organized."
    },
    {
      icon: Sparkles,
      title: "Personalized Insights",
      description: "Get AI-generated insights about each job opportunity, including why it matches your profile and what to focus on."
    },
    {
      icon: MessageSquare,
      title: "24/7 AI Support",
      description: "Get help anytime with our AI assistant. Ask questions about jobs, get interview tips, or practice for interviews."
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
              Find Your Next Position
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive features designed to help you discover job opportunities, 
            prepare effectively, and land your dream role with AI-powered assistance.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="group"
              onClick={() => navigate('/onboarding/step1')}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/about')}
            >
              Learn More
            </Button>
          </div>
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
              The essential tools and capabilities that help you find and prepare for your next opportunity
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
              Even more features to enhance your job search and preparation experience
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
                Built for Job Seekers, Designed for Success
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                Whether you're a recent graduate or an experienced professional, JobsearchAI 
                provides the tools and insights you need to find and prepare for your next opportunity.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Automatic skills extraction from your resume</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">AI-powered job matching and ranking</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Personalized preparation tasks and checklists</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">24/7 AI assistant for career guidance</span>
                </li>
              </ul>
              <Button 
                size="lg" 
                variant="gradient"
                className="group"
                onClick={() => navigate('/onboarding/step1')}
              >
                Start Your Job Search
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            <div className="p-8 rounded-2xl border border-border bg-gradient-to-br from-card to-card/50">
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Job Match Accuracy</span>
                    <span className="text-sm font-bold text-primary">95%+</span>
                  </div>
                  <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-brand rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Processing Speed</span>
                    <span className="text-sm font-bold text-primary">&lt;2 min</span>
                  </div>
                  <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Data Privacy</span>
                    <span className="text-sm font-bold text-primary">100%</span>
                  </div>
                  <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-4xl mx-auto text-center p-12 rounded-2xl border border-border bg-gradient-to-br from-card to-card/50">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Your Next Great Position?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Start your job search today and let AI help you discover opportunities and prepare for success. 
            It only takes a few minutes to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="group"
              onClick={() => navigate('/onboarding/step1')}
            >
              Start Your Job Search
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/about')}
            >
              Learn More About Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

