'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, X, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSettingsStore } from '@/store/settings';
import { useCandidatesStore } from '@/store/candidates';
import { useJobsStore } from '@/store/jobs';
import { useMatchesStore } from '@/store/matches';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  const router = useRouter();
  const { settings, loadSettings, updateSettings } = useSettingsStore();
  const { candidates } = useCandidatesStore();
  const { jobs } = useJobsStore();
  const { matches } = useMatchesStore();

  const [apiKey, setApiKey] = useState('');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [editingSkills, setEditingSkills] = useState<Record<string, string[]>>({});
  const [newSkill, setNewSkill] = useState('');
  const [newSynonym, setNewSynonym] = useState('');

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (settings) {
      setApiKey(settings.apiKey || '');
      setReducedMotion(settings.reducedMotion);
      setEditingSkills(settings.skillDictionary || {});
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    if (!settings) return;

    await updateSettings({
      ...settings,
      apiKey: apiKey.trim() || undefined,
      reducedMotion,
      skillDictionary: editingSkills,
    });

    toast.success('Settings saved');
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;

    const skillKey = newSkill.toLowerCase().trim();
    if (editingSkills[skillKey]) {
      toast.error('Skill already exists');
      return;
    }

    setEditingSkills({
      ...editingSkills,
      [skillKey]: [],
    });
    setNewSkill('');
    toast.success(`Added skill: ${skillKey}`);
  };

  const handleAddSynonym = (skillKey: string) => {
    if (!newSynonym.trim()) return;

    const synonym = newSynonym.toLowerCase().trim();
    const currentSynonyms = editingSkills[skillKey] || [];

    if (currentSynonyms.includes(synonym)) {
      toast.error('Synonym already exists');
      return;
    }

    setEditingSkills({
      ...editingSkills,
      [skillKey]: [...currentSynonyms, synonym],
    });
    setNewSynonym('');
    toast.success(`Added synonym to ${skillKey}`);
  };

  const handleRemoveSynonym = (skillKey: string, synonym: string) => {
    setEditingSkills({
      ...editingSkills,
      [skillKey]: editingSkills[skillKey].filter((s) => s !== synonym),
    });
  };

  const handleRemoveSkill = (skillKey: string) => {
    const { [skillKey]: _, ...rest } = editingSkills;
    setEditingSkills(rest);
    toast.success(`Removed skill: ${skillKey}`);
  };

  const handleClearAllData = async () => {
    if (confirm('Are you sure you want to clear all data? This will delete all candidates, jobs, and matches. This action cannot be undone.')) {
      try {
        const { openDB } = await import('idb');
        const db = await openDB('hirelens-db', 1);

        const tx = db.transaction(['candidates', 'jobs', 'matches'], 'readwrite');
        await tx.objectStore('candidates').clear();
        await tx.objectStore('jobs').clear();
        await tx.objectStore('matches').clear();
        await tx.done;

        toast.success('All data cleared successfully');

        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } catch (error) {
        console.error('Error clearing data:', error);
        toast.error('Failed to clear data');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => router.push('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-900">Preferences</CardTitle>
            <CardDescription>Customize your HireLens experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reducedMotion">Reduced Motion</Label>
                <p className="text-sm text-gray-500">
                  Minimize animations and transitions
                </p>
              </div>
              <Switch
                id="reducedMotion"
                checked={reducedMotion}
                onCheckedChange={setReducedMotion}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>
              Future feature: Bring Your Own Key for AI embeddings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key (Not currently used)</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key..."
              />
              <p className="text-xs text-gray-500">
                This will be used when semantic embeddings are enabled in the future
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skill Dictionary</CardTitle>
            <CardDescription>
              Manage skill synonyms for better matching
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add new skill..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              />
              <Button onClick={handleAddSkill}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3">
              {editingSkills && Object.entries(editingSkills)
                .sort(([a], [b]) => a.localeCompare(b))
                .slice(0, 20)
                .map(([skill, synonyms]) => (
                  <div
                    key={skill}
                    className="p-3 border border-gray-200 rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{skill}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSkill(skill)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {synonyms.map((synonym) => (
                        <Badge key={synonym} variant="secondary">
                          {synonym}
                          <button
                            onClick={() => handleRemoveSynonym(skill, synonym)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        size={1}
                        value={newSynonym}
                        onChange={(e) => setNewSynonym(e.target.value)}
                        placeholder="Add synonym..."
                        onKeyPress={(e) =>
                          e.key === 'Enter' && handleAddSynonym(skill)
                        }
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddSynonym(skill)}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              {editingSkills && Object.keys(editingSkills).length > 20 && (
                <p className="text-sm text-gray-500 text-center">
                  Showing first 20 skills. Total: {Object.keys(editingSkills).length}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              Permanently delete all data from your browser
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 mb-3">
                <strong>Warning:</strong> This will permanently delete:
              </p>
              <ul className="text-sm text-red-700 space-y-1 mb-4 ml-4 list-disc">
                <li>{candidates.length} candidate(s)</li>
                <li>{jobs.length} job(s)</li>
                <li>{matches.length} match(es)</li>
              </ul>
              <Button
                variant="destructive"
                onClick={handleClearAllData}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={handleSaveSettings} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
