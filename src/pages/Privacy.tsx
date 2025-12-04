/**
 * Privacy Policy page
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function Privacy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>1. Introduction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Welcome to JobsearchAI ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our job search application.
            </p>
            <p>
              By using JobsearchAI, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-2">2.1 Information You Provide</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Resume Data:</strong> We collect and process your resume content, including work experience, education, skills, and other professional information you upload.</li>
                <li><strong>Profile Information:</strong> Information you provide during onboarding, including your name, current title, years of experience, salary preferences, location preferences, and remote work preferences.</li>
                <li><strong>Job Preferences:</strong> Your job search preferences, including preferred job sites, favorite jobs, application status, notes, and custom links.</li>
                <li><strong>Chat Messages:</strong> Messages you send to our AI assistant (Jobby) for job search assistance.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">2.2 Automatically Collected Information</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Usage Data:</strong> Information about how you interact with our application, including pages visited, features used, and time spent.</li>
                <li><strong>Device Information:</strong> Browser type, device type, operating system, and IP address.</li>
                <li><strong>Session Data:</strong> Data stored locally in your browser (IndexedDB and localStorage) to maintain your session and preferences.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Provide, maintain, and improve our job search services</li>
              <li>Match you with relevant job opportunities based on your skills, experience, and preferences</li>
              <li>Generate personalized job preparation tasks and interview guidance</li>
              <li>Enable AI-powered features, including resume analysis, job matching, and chat assistance</li>
              <li>Store your job search progress, favorites, and application status</li>
              <li>Communicate with you about your account and our services</li>
              <li>Analyze usage patterns to improve our platform</li>
              <li>Comply with legal obligations and protect our rights</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Data Storage and Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              <strong>Local Storage:</strong> Your data is primarily stored locally in your browser using IndexedDB and localStorage. This means your resume, profile information, and job preferences are stored on your device and are not automatically transmitted to our servers.
            </p>
            <p>
              <strong>Third-Party Services:</strong> We use third-party services (Groq AI and Tavily) to provide AI-powered features and job search functionality. When you use these features, relevant data may be transmitted to these services in accordance with their privacy policies.
            </p>
            <p>
              <strong>Security Measures:</strong> We implement appropriate technical and organizational measures to protect your information. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Data Sharing and Disclosure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>We do not sell your personal information. We may share your information only in the following circumstances:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Service Providers:</strong> With third-party service providers (Groq AI, Tavily) who assist us in operating our platform and providing services to you</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you explicitly consent to sharing your information</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Your Rights and Choices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>You have the following rights regarding your personal information:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Access:</strong> You can access your data stored locally in your browser</li>
              <li><strong>Correction:</strong> You can update your profile information and preferences at any time</li>
              <li><strong>Deletion:</strong> You can clear your local data by clearing your browser's IndexedDB and localStorage</li>
              <li><strong>Opt-Out:</strong> You can stop using our service at any time</li>
            </ul>
            <p>
              To exercise these rights, you can use your browser's developer tools to access and manage your local storage, or contact us using the information provided below.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Our service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Changes to This Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> privacy@jobsearchai.com<br />
              <strong>Website:</strong> <a href="/" className="text-primary hover:underline">www.jobsearchai.com</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

