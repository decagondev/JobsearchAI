/**
 * Settings page for managing user preferences
 * Allows users to include/exclude specific job sites from search
 */

import { Loader2, CheckCircle2, XCircle, Minus } from 'lucide-react'
import { useSettings } from '@/hooks/useSettings'
import { JOB_SITES } from '@/lib/jobSites'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { JobSitePreference } from '@/types/session'

/**
 * Settings page component
 */
export function Settings() {
  const {
    jobSitePreferences,
    updateJobSitePreference,
    resetJobSitePreferences,
    isLoading,
  } = useSettings()

  const handlePreferenceChange = async (siteName: string, preference: JobSitePreference) => {
    try {
      await updateJobSitePreference(siteName, preference)
    } catch (error) {
      console.error('Failed to update preference:', error)
    }
  }

  const getPreference = (siteName: string): JobSitePreference => {
    return jobSitePreferences[siteName] || 'neutral'
  }

  const getPreferenceIcon = (preference: JobSitePreference) => {
    switch (preference) {
      case 'include':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'exclude':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getPreferenceLabel = (preference: JobSitePreference) => {
    switch (preference) {
      case 'include':
        return 'Included'
      case 'exclude':
        return 'Excluded'
      default:
        return 'Neutral'
    }
  }

  const getPreferenceColor = (preference: JobSitePreference) => {
    switch (preference) {
      case 'include':
        return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/50'
      case 'exclude':
        return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/50'
      default:
        return 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/50'
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your job search preferences and site filters
          </p>
        </div>

        {/* Job Site Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Job Site Preferences</CardTitle>
                <CardDescription className="mt-2">
                  Control which job sites to include or exclude from your search results.
                  <br />
                  <strong>Include:</strong> Prioritize jobs from these sites
                  <br />
                  <strong>Exclude:</strong> Filter out jobs from these sites
                  <br />
                  <strong>Neutral:</strong> No special preference (default)
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={resetJobSitePreferences}
              >
                Reset All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {JOB_SITES.map((site) => {
                const preference = getPreference(site.name)
                return (
                  <div
                    key={site.name}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{site.name}</h3>
                          <Badge className={getPreferenceColor(preference)}>
                            {getPreferenceIcon(preference)}
                            <span className="ml-1">{getPreferenceLabel(preference)}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {site.domains.join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={preference === 'include' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePreferenceChange(site.name, 'include')}
                        className="min-w-[100px]"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Include
                      </Button>
                      <Button
                        variant={preference === 'exclude' ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => handlePreferenceChange(site.name, 'exclude')}
                        className="min-w-[100px]"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Exclude
                      </Button>
                      <Button
                        variant={preference === 'neutral' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePreferenceChange(site.name, 'neutral')}
                        className="min-w-[100px]"
                      >
                        <Minus className="h-4 w-4 mr-1" />
                        Neutral
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>
              Current job site preference summary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <h3 className="font-semibold">Included</h3>
                </div>
                <p className="text-2xl font-bold">
                  {Object.values(jobSitePreferences).filter(p => p === 'include').length}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Sites prioritized in search
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <h3 className="font-semibold">Excluded</h3>
                </div>
                <p className="text-2xl font-bold">
                  {Object.values(jobSitePreferences).filter(p => p === 'exclude').length}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Sites filtered from results
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Minus className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Neutral</h3>
                </div>
                <p className="text-2xl font-bold">
                  {JOB_SITES.length - Object.keys(jobSitePreferences).length}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Sites with no preference
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

