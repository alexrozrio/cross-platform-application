import React from 'react';
import { useParams } from 'wouter';
import { useGetBadgeShare } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { BADGE_META, formatPeriodLabel } from '@/lib/badge-utils';
import { BadgeShareSheet } from '@/components/badge-share-sheet';

export default function BadgeSharePage() {
  const params = useParams<{ token: string }>();
  const [, setLocation] = useLocation();
  const { data: badge, isLoading, isError } = useGetBadgeShare(params.token ?? '', {
    // A 404 is terminal for a share token. Retrying keeps visitors on the
    // loading state for several seconds before the existing error UI appears.
    query: { enabled: !!params.token, retry: false }
  });

  const [shareOpen, setShareOpen] = React.useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (isLoading) return <div className="p-12 text-center text-muted-foreground">Loading badge…</div>;
  if (isError || !badge) return (
    <div className="p-12 text-center text-muted-foreground">
      <p className="text-lg font-semibold mb-2">Badge not found</p>
      <Button variant="outline" onClick={() => setLocation('/')}>Go Home</Button>
    </div>
  );

  const meta = BADGE_META[badge.badgeType] ?? BADGE_META['weekly_1st'];
  const periodLabel = formatPeriodLabel(badge.tournamentPeriod);

  return (
    <div className="max-w-sm mx-auto w-full space-y-6 animate-in fade-in duration-500 py-8">
      <div className="bg-card border border-border rounded-xl px-3 py-2 w-fit">
        <Button variant="ghost" size="sm" className="gap-2 -ml-1 h-auto p-0" onClick={() => setLocation('/')}>
          <ArrowLeft className="w-4 h-4" /> Home
        </Button>
      </div>

      {/* Badge card */}
      <Card className={`border-2 shadow-xl overflow-hidden ${meta.borderColor}`}>
        <div className={`h-2 w-full ${meta.barColor}`} />
        <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-lg ${meta.bg}`}>
            {meta.emoji}
          </div>
          <div>
            <p className={`text-2xl font-black ${meta.color}`}>{meta.title}</p>
            <p className="text-muted-foreground text-sm mt-1">{meta.subtitle}</p>
          </div>
          <div className="space-y-1">
            <p className="text-4xl font-black tabular-nums">{badge.totalPoints.toLocaleString()}</p>
            <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">total points</p>
          </div>
          <div className="w-full pt-2 border-t space-y-1">
            <p className="text-base font-bold">{badge.username}</p>
            <p className="text-xs text-muted-foreground">{periodLabel}</p>
          </div>
        </CardContent>
      </Card>

      {/* CTA for visitors */}
      <div className="rounded-xl border bg-card shadow-sm p-4 text-center space-y-2">
        <p className="text-sm font-semibold">Can you beat this score?</p>
        <p className="text-xs text-muted-foreground">Play Brain Games 4 All — free, no download needed.</p>
        <Button className="w-full mt-1" onClick={() => setLocation('/')}>
          Start Playing →
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl p-3">
        <Button className="w-full gap-2" variant="outline" onClick={() => setShareOpen(true)}>
          <Share2 className="w-4 h-4" />
          Share this badge
        </Button>
      </div>

      <BadgeShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        shareUrl={shareUrl}
        badgeTitle={meta.title}
        username={badge.username}
        points={badge.totalPoints}
        period={periodLabel}
      />
    </div>
  );
}
