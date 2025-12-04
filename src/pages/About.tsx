import { useNavigate } from "react-router-dom"
import { Users, Target, Lightbulb, Heart, Briefcase, Shield, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function About() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            About <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">JobsearchAI</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We're revolutionizing job searching by making AI-powered career assistance accessible to everyone.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/50 backdrop-blur-sm mb-6">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Our Mission</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Empowering Job Seekers Through AI
              </h2>
              <p className="text-muted-foreground text-lg mb-4">
                At JobsearchAI, we believe that finding your next great position shouldn't be 
                overwhelming or time-consuming. Our mission is to democratize AI-powered job 
                search, making it possible for anyone to discover relevant opportunities and 
                prepare effectively for interviews.
              </p>
              <p className="text-muted-foreground text-lg">
                We're committed to providing cutting-edge technology that understands your skills, 
                matches you with the right opportunities, and helps you prepare for success—all 
                while keeping your data private and secure.
              </p>
            </div>
            <div className="p-8 rounded-2xl border border-border bg-gradient-to-br from-card to-card/50">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">AI-Powered Intelligence</h3>
                    <p className="text-muted-foreground">
                      We leverage advanced AI to analyze resumes, match jobs, and generate 
                      personalized preparation tasks.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Job Seeker Focused</h3>
                    <p className="text-muted-foreground">
                      Every feature is designed to help you find and prepare for your next 
                      career opportunity.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
                    <p className="text-muted-foreground">
                      Your resume and data stay on your device. We never share or sell your 
                      personal information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How JobsearchAI Works</h2>
            <p className="text-muted-foreground text-lg">
              A simple, powerful process to help you find your next position
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-6 rounded-lg border border-border bg-card/50">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Resume Analysis</h3>
                  <p className="text-muted-foreground">
                    Upload your resume and our AI automatically extracts your skills, experience, 
                    and qualifications to build a comprehensive profile.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 rounded-lg border border-border bg-card/50">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Smart Job Matching</h3>
                  <p className="text-muted-foreground">
                    Our AI searches the web for relevant opportunities and matches them to your 
                    profile using advanced similarity algorithms.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 rounded-lg border border-border bg-card/50">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Personalized Preparation</h3>
                  <p className="text-muted-foreground">
                    Receive tailored preparation tasks, interview tips, and insights for each 
                    job opportunity to help you stand out.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 rounded-lg border border-border bg-card/50">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">AI Assistant</h3>
                  <p className="text-muted-foreground">
                    Chat with our AI assistant to get answers about jobs, practice interview 
                    questions, and get career advice.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Story</h2>
            <p className="text-muted-foreground text-lg">
              How we started and where we're going
            </p>
          </div>
          
          <div className="space-y-8 text-muted-foreground">
            <p className="text-lg leading-relaxed">
              JobsearchAI was born from a simple observation: job searching shouldn't be a 
              frustrating, time-consuming process. We set out to create a platform that makes 
              AI-powered career assistance accessible to everyone, from recent graduates to 
              experienced professionals looking for their next opportunity.
            </p>
            <p className="text-lg leading-relaxed">
              Today, we're helping job seekers discover opportunities that match their skills 
              and preferences, while providing personalized preparation guidance to increase 
              their chances of success. Our AI-powered approach saves time and helps you focus 
              on what matters most—preparing for interviews and landing your dream role.
            </p>
            <p className="text-lg leading-relaxed">
              As we look to the future, we're excited to continue innovating and expanding 
              what's possible with AI in career development. Our commitment remains the same: 
              to provide the best tools and platform for job seekers to find and prepare for 
              their next great position.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center p-12 rounded-2xl border border-border bg-gradient-to-br from-card to-card/50">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Your Next Great Position?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join job seekers who are using AI to discover opportunities and prepare for success. 
            Start your journey today—it only takes a few minutes.
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
              onClick={() => navigate('/features')}
            >
              Explore Features
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

