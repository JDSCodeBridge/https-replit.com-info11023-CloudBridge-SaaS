import { useParams, useLocation } from "wouter";
import AppLayout from "./layout";
import {
  useGetRepository,
  useGetRepositoryAnalysis,
  useAnalyzeRepository,
  useCreateServiceRequest,
  getListRepositoriesQueryKey,
  getGetRepositoryQueryKey,
  getGetRepositoryAnalysisQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, AlertTriangle, Info, Cloud, Smartphone, CheckCircle2, ArrowLeft, Zap } from "lucide-react";
import { Link } from "wouter";

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? "bg-primary" : score >= 60 ? "bg-yellow-400" : "bg-destructive";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums">{score}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

const severityIcon = {
  critical: <AlertCircle className="w-4 h-4 text-destructive shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />,
  info: <Info className="w-4 h-4 text-primary shrink-0" />,
};

const difficultyColor = {
  easy: "text-green-400 bg-green-400/10 border-green-400/20",
  medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  hard: "text-destructive bg-destructive/10 border-destructive/20",
};

export default function RepositoryDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0");
  const qc = useQueryClient();
  const [, navigate] = useLocation();

  const { data: repo, isLoading: loadingRepo } = useGetRepository(id, { query: { enabled: !!id, queryKey: getGetRepositoryQueryKey(id) } });
  const { data: analysis, isLoading: loadingAnalysis } = useGetRepositoryAnalysis(id, { query: { enabled: !!id, queryKey: getGetRepositoryAnalysisQueryKey(id) } });
  const analyzeMutation = useAnalyzeRepository();
  const serviceMutation = useCreateServiceRequest();

  const handleAnalyze = () => {
    analyzeMutation.mutate({ id }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListRepositoriesQueryKey() });
      },
    });
  };

  const handleDeploy = (provider: string) => {
    serviceMutation.mutate({
      data: {
        serviceType: "deploy_for_me",
        repositoryId: id,
        description: `Deploy to ${provider}`,
      },
    });
  };

  if (loadingRepo) {
    return (
      <AppLayout>
        <div className="p-8 max-w-4xl mx-auto space-y-4 animate-pulse">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-secondary/30" />)}
        </div>
      </AppLayout>
    );
  }

  if (!repo) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-muted-foreground">Repository not found.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/repositories">
            <a className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-sm">
              <ArrowLeft className="w-4 h-4" /> Repositories
            </a>
          </Link>
        </div>

        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">{repo.fullName}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              {repo.framework && <Badge variant="secondary">{repo.framework}</Badge>}
              {repo.language && <Badge variant="outline">{repo.language}</Badge>}
              <Badge
                variant="outline"
                className={repo.deploymentStatus === "deployed" ? "text-primary border-primary/30" : ""}
              >
                {repo.deploymentStatus.replace("_", " ")}
              </Badge>
            </div>
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={analyzeMutation.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Zap className="w-4 h-4 mr-2" />
            {analyzeMutation.isPending ? "Analyzing..." : "Run AI Analysis"}
          </Button>
        </div>

        {analysis ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border/40 bg-card/30">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Deployment Readiness</CardTitle>
                    <span className={`text-3xl font-bold ${analysis.overallScore >= 80 ? "text-primary" : analysis.overallScore >= 60 ? "text-yellow-400" : "text-destructive"}`}>
                      {analysis.overallScore}
                      <span className="text-base font-normal text-muted-foreground">/100</span>
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ScoreBar label="Infrastructure" score={analysis.infrastructureScore} />
                  <ScoreBar label="Security" score={analysis.securityScore} />
                  <ScoreBar label="Environment Variables" score={analysis.envVarsScore} />
                  <ScoreBar label="Database Configuration" score={analysis.databaseScore} />
                </CardContent>
              </Card>

              <Card className="border-border/40 bg-card/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Detected Stack</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Frontend</div>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.detectedFrameworks.map((f: string) => <Badge key={f} variant="secondary">{f}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Backend</div>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.detectedBackend.map((b: string) => <Badge key={b} variant="secondary">{b}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Database</div>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.detectedDatabase.map((d: string) => <Badge key={d} variant="secondary">{d}</Badge>)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/40 bg-card/30">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.recommendations.map((rec: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20 border border-border/30">
                    {severityIcon[rec.severity as keyof typeof severityIcon]}
                    <div>
                      <div className="text-sm font-medium">{rec.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{rec.description}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/30">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Deployment Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.deploymentOptions.map((opt: any, i: number) => (
                    <div key={i} className="p-4 rounded-xl border border-border/40 bg-secondary/10 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {opt.type === "mobile" ? <Smartphone className="w-5 h-5 text-accent" /> : <Cloud className="w-5 h-5 text-primary" />}
                          <span className="font-semibold">{opt.provider}</span>
                        </div>
                        <Badge variant="outline" className={difficultyColor[opt.difficulty as keyof typeof difficultyColor]}>
                          {opt.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{opt.description}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Cost: <strong className="text-foreground">{opt.estimatedCost}</strong></span>
                        <span>Time: <strong className="text-foreground">{opt.estimatedTime}</strong></span>
                      </div>
                      <Button size="sm" variant="outline" className="w-full border-border/40" onClick={() => handleDeploy(opt.provider)}>
                        Deploy For Me
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : loadingAnalysis ? (
          <Card className="border-border/40 bg-card/30 p-8 text-center text-muted-foreground">Loading analysis...</Card>
        ) : (
          <Card className="border-border/40 bg-card/30 p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Analysis Yet</h3>
            <p className="text-sm text-muted-foreground mb-6">Run AI Analysis to get a deployment readiness score, stack detection, and recommendations.</p>
            <Button onClick={handleAnalyze} disabled={analyzeMutation.isPending} className="bg-primary text-primary-foreground">
              <Zap className="w-4 h-4 mr-2" />
              {analyzeMutation.isPending ? "Analyzing..." : "Run AI Analysis"}
            </Button>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
