
'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Trophy, Circle, CheckCircle } from 'lucide-react';
import { useApp } from '@/hooks/use-app';
import { useToast } from '@/hooks/use-toast';
import { TokenIcon } from '@/components/icons/token-icon';
import type { Quest } from '@/contexts/app-context';
import { cn } from '@/lib/utils';

const QuestItem = ({ quest }: { quest: Quest }) => {
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
        if (quest.link) {
            router.push(quest.link);
        }
    };

    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value={quest.id} className="border-b-0">
                <AccordionTrigger className="hover:no-underline text-sm p-3">
                    <div className="flex items-center gap-3 flex-1">
                        {quest.isClaimed ? (
                            <CheckCircle className="w-5 h-5 text-muted-foreground" />
                        ) : quest.isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                            <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                        <div className="flex-1 text-left font-medium">{quest.title}</div>
                        <div className="flex items-center gap-1 text-primary font-bold text-xs">
                            <TokenIcon className="w-3 h-3" />
                            <span>+{quest.reward}</span>
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                    <div className="pl-8 space-y-3">
                        <p className="text-muted-foreground text-xs">{quest.description}</p>
                         {quest.isClaimed ? (
                             <Button variant="outline" size="sm" disabled className="w-full h-8">
                                Already Claimed
                            </Button>
                        ) : (
                           quest.isCompleted ? (
                             <Button size="sm" onClick={handleClaim} className="w-full h-8">Claim Reward</Button>
                           ) : (
                            quest.link ? (
                                <Button variant="outline" size="sm" onClick={handleGoTo} className="w-full h-8">Go to Task</Button>
                            ) : (
                                <Button variant="outline" size="sm" disabled className="w-full h-8">In Progress</Button>
                            )
                           )
                        )}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export const QuestsWidget = () => {
    const { quests } = useApp();

    const dailyQuests = quests.filter(q => q.category === 'daily');
    const weeklyQuests = quests.filter(q => q.category === 'weekly');
    const monthlyQuests = quests.filter(q => q.category === 'monthly');

    const availableQuestsCount = useMemo(() => {
        return quests.filter(q => q.isCompleted && !q.isClaimed).length;
    }, [quests]);
    
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="secondary" className="shadow-lg">
                    <Trophy className="mr-2 h-4 w-4" />
                    Quests
                    {availableQuestsCount > 0 && (
                        <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                            {availableQuestsCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <Tabs defaultValue="daily" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="daily">Daily</TabsTrigger>
                        <TabsTrigger value="weekly">Weekly</TabsTrigger>
                        <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    </TabsList>
                    <div className="mt-2 max-h-80 overflow-y-auto">
                        <TabsContent value="daily">
                            {dailyQuests.map(quest => <QuestItem key={quest.id} quest={quest} />)}
                        </TabsContent>
                        <TabsContent value="weekly">
                            {weeklyQuests.map(quest => <QuestItem key={quest.id} quest={quest} />)}
                        </TabsContent>
                        <TabsContent value="monthly">
                             {monthlyQuests.map(quest => <QuestItem key={quest.id} quest={quest} />)}
                        </TabsContent>
                    </div>
                </Tabs>
            </PopoverContent>
        </Popover>
    );
};
