'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useJobsStore } from '@/store/jobs';
import type { Job } from '@/lib/db/types';
import { toast } from 'sonner';

export default function JobDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === 'new';

  const { jobs, addJob, updateJob, loadJobs } = useJobsStore();

  const [formData, setFormData] = useState<Omit<Job, 'id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    description: '',
    mustHaveSkills: [],
    niceToHaveSkills: [],
    minYears: 0,
    location: '',
    isActive: true,
  });

  const [mustHaveInput, setMustHaveInput] = useState('');
  const [niceToHaveInput, setNiceToHaveInput] = useState('');

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    if (!isNew) {
      const job = jobs.find((j) => j.id === id);
      if (job) {
        setFormData({
          title: job.title,
          description: job.description,
          mustHaveSkills: job.mustHaveSkills,
          niceToHaveSkills: job.niceToHaveSkills,
          minYears: job.minYears,
          location: job.location || '',
          isActive: job.isActive,
        });
        setMustHaveInput(job.mustHaveSkills.join(', '));
        setNiceToHaveInput(job.niceToHaveSkills.join(', '));
      }
    }
  }, [id, isNew, jobs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Job title is required');
      return;
    }

    const mustHaveSkills = mustHaveInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const niceToHaveSkills = niceToHaveInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const now = Date.now();
    const jobData: Job = {
      id: isNew ? `job-${now}-${Math.random().toString(36).substring(2, 9)}` : id,
      ...formData,
      mustHaveSkills,
      niceToHaveSkills,
      createdAt: isNew ? now : jobs.find((j) => j.id === id)?.createdAt || now,
      updatedAt: now,
    };

    try {
      if (isNew) {
        await addJob(jobData);
        toast.success('Job created');
      } else {
        await updateJob(jobData);
        toast.success('Job updated');
      }
      router.push('/jobs');
    } catch (error) {
      toast.error('Failed to save job');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50  p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => router.push('/jobs')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{isNew ? 'Create New Job' : 'Edit Job'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Senior Frontend Developer"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Job description and responsibilities..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mustHaveSkills">Must-Have Skills *</Label>
                <Input
                  id="mustHaveSkills"
                  value={mustHaveInput}
                  onChange={(e) => setMustHaveInput(e.target.value)}
                  placeholder="react, typescript, next.js (comma-separated)"
                />
                <p className="text-xs text-gray-500 ">
                  Separate skills with commas. Missing must-have skills will reduce match score.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="niceToHaveSkills">Nice-to-Have Skills</Label>
                <Input
                  id="niceToHaveSkills"
                  value={niceToHaveInput}
                  onChange={(e) => setNiceToHaveInput(e.target.value)}
                  placeholder="graphql, docker, aws (comma-separated)"
                />
                <p className="text-xs text-gray-500 ">
                  Nice-to-have skills will boost match score if present.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minYears">Minimum Years of Experience</Label>
                <Input
                  id="minYears"
                  type="number"
                  min="0"
                  value={formData.minYears}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minYears: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., New York, NY"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label htmlFor="isActive">Active Job Posting</Label>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {isNew ? 'Create Job' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/jobs')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
