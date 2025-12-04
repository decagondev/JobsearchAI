/**
 * Terms of Use page
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function Terms() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">Terms of Use</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              By accessing and using JobsearchAI ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
            <p>
              These Terms of Use ("Terms") govern your access to and use of JobsearchAI, including our website, mobile application, and related services (collectively, "the Service"). Please read these Terms carefully before using our Service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Description of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              JobsearchAI is an AI-powered job search platform that helps users:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Upload and analyze resumes to extract skills and qualifications</li>
              <li>Search for job opportunities using AI-powered matching</li>
              <li>Receive personalized job recommendations based on their profile</li>
              <li>Get preparation tasks and interview guidance for specific jobs</li>
              <li>Track job applications and manage their job search process</li>
              <li>Interact with an AI assistant for job search support</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. User Accounts and Responsibilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-2">3.1 Account Creation</h3>
              <p>
                You may be required to create an account or provide information to use certain features of the Service. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">3.2 Account Security</h3>
              <p>
                You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">3.3 Acceptable Use</h3>
              <p>You agree not to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Use the Service for any illegal purpose or in violation of any laws</li>
                <li>Upload malicious code, viruses, or harmful content</li>
                <li>Attempt to gain unauthorized access to the Service or its systems</li>
                <li>Interfere with or disrupt the Service or servers connected to the Service</li>
                <li>Use automated systems to access the Service without permission</li>
                <li>Impersonate any person or entity or misrepresent your affiliation</li>
                <li>Collect or harvest information about other users</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Intellectual Property Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              <strong>Our Content:</strong> The Service, including its original content, features, and functionality, is owned by JobsearchAI and is protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p>
              <strong>Your Content:</strong> You retain ownership of any content you upload, including your resume, profile information, and job preferences. By using the Service, you grant us a license to use, process, and store your content solely for the purpose of providing and improving the Service.
            </p>
            <p>
              <strong>AI-Generated Content:</strong> Content generated by our AI features (such as job summaries, preparation tasks, and chat responses) is provided for informational purposes only and should not be considered professional advice.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Third-Party Services and Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Our Service may integrate with or link to third-party services, including:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Groq AI:</strong> Used for AI-powered features and chat assistance</li>
              <li><strong>Tavily:</strong> Used for job search functionality</li>
              <li><strong>Job Sites:</strong> Links to external job posting websites</li>
            </ul>
            <p>
              We are not responsible for the content, privacy policies, or practices of third-party services. Your interactions with third-party services are solely between you and the third party.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Disclaimers and Limitations of Liability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-2">6.1 Service Availability</h3>
              <p>
                We strive to provide a reliable service, but we do not guarantee that the Service will be available, uninterrupted, secure, or error-free. The Service is provided "as is" and "as available" without warranties of any kind.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">6.2 Job Listings and Matching</h3>
              <p>
                We do not guarantee the accuracy, completeness, or availability of job listings. Job matching scores are estimates based on algorithmic analysis and should not be considered definitive assessments of job suitability. You are responsible for verifying job details and making your own employment decisions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">6.3 AI-Generated Content</h3>
              <p>
                AI-generated content, including job summaries, preparation tasks, and chat responses, is provided for informational purposes only and should not be considered professional career, legal, or financial advice. Always verify important information independently.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">6.4 Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by law, JobsearchAI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Service.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Indemnification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              You agree to indemnify, defend, and hold harmless JobsearchAI and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or in any way connected with your access to or use of the Service, your violation of these Terms, or your infringement of any rights of another.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Termination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Service will cease immediately.
            </p>
            <p>
              You may stop using the Service at any time by clearing your browser data or discontinuing use of the platform.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Governing Law and Dispute Resolution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which JobsearchAI operates, without regard to its conflict of law provisions.
            </p>
            <p>
              Any disputes arising out of or relating to these Terms or the Service shall be resolved through binding arbitration in accordance with applicable arbitration rules, except where prohibited by law.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
            <p>
              By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you must stop using the Service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>11. Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              If you have any questions about these Terms of Use, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> legal@jobsearchai.com<br />
              <strong>Website:</strong> <a href="/" className="text-primary hover:underline">www.jobsearchai.com</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

