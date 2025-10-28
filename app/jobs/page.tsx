'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useJobsStore } from '@/store/jobs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function JobsPage() {
  const router = useRouter();
  const { jobs, loadJobs, deleteJob } = useJobsStore();

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      await deleteJob(id);
      toast.success('Job deleted');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50  p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Jobs</h1>
          </div>
          <Button asChild>
            <Link href="/jobs/new">
              <Plus className="w-4 h-4 mr-2" />
              Create Job
            </Link>
          </Button>
        </div>

        {jobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600  mb-4">
                No jobs yet. Create your first job to start matching candidates.
              </p>
              <Button asChild>
                <Link href="/jobs/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Job
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        {job.isActive ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600  line-clamp-2">
                        {job.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                      >
                        <Link href={`/jobs/${job.id}`}>
                          <Pencil className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(job.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium">Must-have skills:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {job.mustHaveSkills.map((skill) => (
                          <Badge key={skill} variant="default">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {job.niceToHaveSkills.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Nice-to-have skills:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {job.niceToHaveSkills.map((skill) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-4 text-sm text-gray-600 ">
                      {job.minYears > 0 && (
                        <span>Min Experience: {job.minYears} years</span>
                      )}
                      {job.location && <span>Location: {job.location}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
