
'use client';

import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { useApp } from '@/hooks/use-app';
import { TokenIcon } from '@/components/icons/token-icon';
import { useToast } from '@/hooks/use-toast';
import type { Quest } from '@/contexts/app-context';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, CheckCircle, ShieldCheck } from 'lucide-react';


const QuestCard = ({ quest }: { quest: Quest }) => {
    const { claimQuestReward } = useApp();
    const { toast } = useToast();
    const router = useRouter();

    const handleClaim = () => {
        if (quest.isCompleted && !quest.isClaimed) {
            claimQuestReward(quest.id);
            toast({
                title: 'Reward Claimed!',
                description: `You've earned ${quest.reward} $ECLB tokens.`,
            });
        }
    };

    const handleGoTo = () => {
        if(quest.link) {
            router.push(quest.link)
        }
    }

    const buttonDisabled = !quest.isCompleted || quest.isClaimed;

    return (
        <Accordion type="single" collapsible className="w-full bg-secondary/30 rounded-lg">
            <AccordionItem value={quest.id} className="border-b-0">
                <AccordionTrigger className="hover:no-underline p-4">
                    <div className="flex items-center gap-4 flex-1">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            quest.isClaimed ? "bg-muted text-muted-foreground" : quest.isCompleted ? "bg-green-500 text-white" : "bg-primary/20 text-primary"
                        )}>
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-semibold">{quest.title}</p>
                            <div className="flex items-center gap-1 text-primary">
                                <TokenIcon className="w-4 h-4" />
                                <span className="font-bold text-sm">+{quest.reward} Tokens</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-center w-6 h-6 rounded-full border-2">
                           {quest.isClaimed && <Check className="w-4 h-4 text-muted-foreground" />}
                           {quest.isCompleted && !quest.isClaimed && <Check className="w-4 h-4 text-green-500" />}
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                    <div className="pl-12 space-y-4">
                        <p className="text-muted-foreground text-sm">{quest.description}</p>
                        {quest.isClaimed ? (
                             <Button variant="outline" disabled className="w-full">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Already Claimed
                            </Button>
                        ) : (
                           quest.isCompleted ? (
                             <Button onClick={handleClaim} className="w-full">Claim Reward</Button>
                           ) : (
                            quest.link ? (
                                <Button variant="outline" onClick={handleGoTo} className="w-full">Go to Task</Button>
                            ) : (
                                <Button variant="outline" disabled className="w-full">In Progress</Button>
                            )
                           )
                        )}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default function QuestsPage() {
    const { quests } = useApp();

    const dailyQuests = quests.filter(q => q.category === 'daily');
    const weeklyQuests = quests.filter(q => q.category === 'weekly');
    const monthlyQuests = quests.filter(q => q.category === 'monthly');

    return (
        <AppShell>
            <div className="p-4 space-y-6">
                 <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Quests</h1>
                    <p className="text-muted-foreground">Complete quests to earn token rewards. New quests appear periodically, so check back often!</p>
                </div>
            
                <div className="space-y-4">
                    <h3 className="text-xl font-bold">Daily Quests</h3>
                    {dailyQuests.length > 0 ? (
                        dailyQuests.map(quest => <QuestCard key={quest.id} quest={quest} />)
                    ) : (
                        <p className="text-sm text-muted-foreground">No daily quests available.</p>
                    )}
                </div>
                
                <div className="space-y-4">
                    <h3 className="text-xl font-bold">Weekly Quests</h3>
                    {weeklyQuests.length > 0 ? (
                        weeklyQuests.map(quest => <QuestCard key={quest.id} quest={quest} />)
                    ) : (
                        <p className="text-sm text-muted-foreground">No weekly quests available.</p>
                    )}
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-bold">Monthly Quests</h3>
                    {monthlyQuests.length > 0 ? (
                        monthlyQuests.map(quest => <QuestCard key={quest.id} quest={quest} />)
                    ) : (
                        <p className="text-sm text-muted-foreground">No monthly quests available.</p>
                    )}
                </div>
            </div>
        </AppShell>
    );
}
