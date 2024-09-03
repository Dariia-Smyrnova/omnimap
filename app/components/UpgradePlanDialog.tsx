import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';

interface UpgradePlanDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UpgradePlanDialog({ isOpen, onClose }: UpgradePlanDialogProps) {

    const user = useUser().user;
        
    const onGetStarted = () => {
        window.location.href = `https://powerupsandboosters.lemonsqueezy.com/buy/bbd87f5d-4ad5-4016-ab0c-c7e2e06a011f?checkout[email]=${user.primaryEmailAddress.emailAddress}&checkout[name]=${user.fullName}`;
    };
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upgrade Plan</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    <p>Upgrade plan to enrich results</p>
                </div>
                <DialogFooter>
                    <Button onClick={onGetStarted}>Get Started</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}