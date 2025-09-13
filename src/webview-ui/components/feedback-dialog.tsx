"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { MessageSquare, Bug, Sparkles, Send, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";
import { FEEDBACK_CONFIG } from "../config/feedback";

type FeedbackType = "bug" | "feature";
type BugSeverity = "critical" | "high" | "medium" | "low" | "improvement";

interface FeedbackFormData {
  type: FeedbackType;
  title: string;
  description: string;
  severity?: BugSeverity;
  steps?: string;
  expected?: string;
  actual?: string;
}

export default function FeedbackDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FeedbackFormData>({
    type: "bug",
    title: "",
    description: "",
    severity: "medium",
    steps: "",
    expected: "",
    actual: "",
  });

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Get GitHub repo URL from config
      const githubRepoUrl = FEEDBACK_CONFIG.GITHUB_REPO_URL;

      // Create issue URL with pre-filled content
      const issueTitle = encodeURIComponent(formData.title);
      const issueBody = encodeURIComponent(generateIssueBody(formData));

      // Add labels based on feedback type
      const labels =
        formData.type === "bug"
          ? FEEDBACK_CONFIG.DEFAULT_LABELS.BUG
          : FEEDBACK_CONFIG.DEFAULT_LABELS.FEATURE;
      const labelsParam = labels
        .map((label) => encodeURIComponent(label))
        .join(",");

      const issueUrl = `${githubRepoUrl}/issues/new?title=${issueTitle}&body=${issueBody}&labels=${labelsParam}`;

      // Open in new tab
      window.open(issueUrl, "_blank");

      // Close sheet and reset form
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateIssueBody = (data: FeedbackFormData): string => {
    if (data.type === "bug") {
      return FEEDBACK_CONFIG.ISSUE_TEMPLATES.BUG.body(data);
    } else {
      return FEEDBACK_CONFIG.ISSUE_TEMPLATES.FEATURE.body(data);
    }
  };

  const resetForm = () => {
    setFormData({
      type: "bug",
      title: "",
      description: "",
      severity: "medium",
      steps: "",
      expected: "",
      actual: "",
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Submit Feedback
          </DialogTitle>
          <DialogDescription>
            Help us improve by reporting bugs or suggesting new features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Feedback Type Selection */}
          <div className="space-y-3">
            <Label>Feedback Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.type === "bug" ? "default" : "outline"}
                size="sm"
                className="flex-1 gap-2"
                onClick={() => setFormData({ ...formData, type: "bug" })}
              >
                <Bug className="h-4 w-4" />
                Bug Report
              </Button>
              <Button
                type="button"
                variant={formData.type === "feature" ? "default" : "outline"}
                size="sm"
                className="flex-1 gap-2"
                onClick={() => setFormData({ ...formData, type: "feature" })}
              >
                <Sparkles className="h-4 w-4" />
                Feature Request
              </Button>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              {formData.type === "bug" ? "Bug Title" : "Feature Title"}
            </Label>
            <Input
              id="title"
              placeholder={
                formData.type === "bug"
                  ? "Brief description of the bug..."
                  : "Brief description of the feature..."
              }
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide a detailed description..."
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* Bug-specific fields */}
          {formData.type === "bug" && (
            <>
              {/* Severity */}
              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value: BugSeverity) =>
                    setFormData({ ...formData, severity: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-xs">
                          Critical
                        </Badge>
                        <span>Critical - App crashes or data loss</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-xs">
                          High
                        </Badge>
                        <span>High - Major functionality broken</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          Medium
                        </Badge>
                        <span>Medium - Minor functionality issues</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Low
                        </Badge>
                        <span>Low - Cosmetic or minor issues</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="improvement">
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="text-xs">
                          Improvement
                        </Badge>
                        <span>Improvement - Enhancement suggestion</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Steps to Reproduce */}
              <div className="space-y-2">
                <Label htmlFor="steps">Steps to Reproduce (Optional)</Label>
                <Textarea
                  id="steps"
                  placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                  rows={3}
                  value={formData.steps}
                  onChange={(e) =>
                    setFormData({ ...formData, steps: e.target.value })
                  }
                />
              </div>

              {/* Expected vs Actual */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="expected">Expected Behavior (Optional)</Label>
                  <Textarea
                    id="expected"
                    placeholder="What should happen..."
                    rows={3}
                    value={formData.expected}
                    onChange={(e) =>
                      setFormData({ ...formData, expected: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actual">Actual Behavior (Optional)</Label>
                  <Textarea
                    id="actual"
                    placeholder="What actually happens..."
                    rows={3}
                    value={formData.actual}
                    onChange={(e) =>
                      setFormData({ ...formData, actual: e.target.value })
                    }
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !formData.title.trim() ||
              !formData.description.trim()
            }
            className="w-full gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Opening GitHub...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Feedback
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
