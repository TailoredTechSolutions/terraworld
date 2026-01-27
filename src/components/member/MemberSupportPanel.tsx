import { useState } from "react";
import {
  Ticket,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface SupportTicket {
  id: string;
  ticketId: string;
  category: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  lastUpdated: string;
  messages: TicketMessage[];
}

interface TicketMessage {
  id: string;
  sender: 'user' | 'admin';
  message: string;
  timestamp: string;
  attachments?: string[];
}

// Mock tickets
const mockTickets: SupportTicket[] = [
  {
    id: '1',
    ticketId: 'TKT-2024-001',
    category: 'Withdrawal',
    subject: 'GCash withdrawal pending for 3 days',
    status: 'in_progress',
    lastUpdated: '2024-01-22T10:30:00',
    messages: [
      {
        id: 'm1',
        sender: 'user',
        message: 'I submitted a withdrawal request 3 days ago but it\'s still pending. Please help.',
        timestamp: '2024-01-20T14:00:00',
      },
      {
        id: 'm2',
        sender: 'admin',
        message: 'Thank you for reaching out. We\'re looking into this issue. Your KYC verification is being reviewed.',
        timestamp: '2024-01-21T09:00:00',
      },
    ],
  },
  {
    id: '2',
    ticketId: 'TKT-2024-002',
    category: 'Account',
    subject: 'Unable to login to my account',
    status: 'resolved',
    lastUpdated: '2024-01-18T16:45:00',
    messages: [
      {
        id: 'm3',
        sender: 'user',
        message: 'I can\'t login to my account. Password reset is not working.',
        timestamp: '2024-01-18T10:00:00',
      },
      {
        id: 'm4',
        sender: 'admin',
        message: 'We\'ve reset your password. Please check your email.',
        timestamp: '2024-01-18T16:45:00',
      },
    ],
  },
];

const CATEGORIES = [
  'Account',
  'Withdrawal',
  'Commissions',
  'Binary Structure',
  'KYC Verification',
  'Technical Issue',
  'Other',
];

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  open: { icon: AlertCircle, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  in_progress: { icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  resolved: { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  closed: { icon: CheckCircle2, color: 'text-muted-foreground', bgColor: 'bg-muted' },
};

const MemberSupportPanel = () => {
  const { toast } = useToast();
  const [tickets] = useState<SupportTicket[]>(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newTicketCategory, setNewTicketCategory] = useState('');
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [replyMessage, setReplyMessage] = useState('');

  const handleCreateTicket = () => {
    if (!newTicketCategory || !newTicketSubject || !newTicketMessage) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Ticket Created",
      description: "Your support ticket has been submitted. We'll respond within 24 hours.",
    });

    setIsNewTicketOpen(false);
    setNewTicketCategory('');
    setNewTicketSubject('');
    setNewTicketMessage('');
  };

  const handleReply = () => {
    if (!replyMessage.trim()) return;

    toast({
      title: "Reply Sent",
      description: "Your message has been sent to the support team.",
    });

    setReplyMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Header with New Ticket Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Support Tickets</h3>
          <p className="text-sm text-muted-foreground">Get help from our support team</p>
        </div>
        <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
              <DialogDescription>
                Describe your issue and we'll get back to you within 24 hours.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newTicketCategory} onValueChange={setNewTicketCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  placeholder="Brief description of your issue"
                  value={newTicketSubject}
                  onChange={(e) => setNewTicketSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Describe your issue in detail..."
                  value={newTicketMessage}
                  onChange={(e) => setNewTicketMessage(e.target.value)}
                  rows={5}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Paperclip className="h-4 w-4" />
                <span>Attach files (optional)</span>
                <Button variant="ghost" size="sm">Browse</Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewTicketOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTicket}>
                Submit Ticket
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Ticket className="h-4 w-4 text-primary" />
                Your Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Ticket className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No tickets yet</p>
                  <p className="text-sm">Create a new ticket to get support</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ticket ID</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tickets.map((ticket) => {
                        const statusConfig = STATUS_CONFIG[ticket.status];
                        const StatusIcon = statusConfig.icon;

                        return (
                          <TableRow
                            key={ticket.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <TableCell className="font-mono text-sm">
                              {ticket.ticketId}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{ticket.category}</Badge>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {ticket.subject}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${statusConfig.bgColor} ${statusConfig.color}`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {ticket.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(ticket.lastUpdated).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ticket Details */}
        <div>
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4 text-primary" />
                Ticket Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTicket ? (
                <div className="space-y-4">
                  {/* Ticket Info */}
                  <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">ID</span>
                      <span className="font-mono">{selectedTicket.ticketId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Category</span>
                      <span>{selectedTicket.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="outline" className="capitalize">
                        {selectedTicket.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm font-medium">{selectedTicket.subject}</p>

                  {/* Message Thread */}
                  <ScrollArea className="h-[250px] pr-4">
                    <div className="space-y-3">
                      {selectedTicket.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-lg text-sm ${
                            msg.sender === 'user'
                              ? 'bg-primary/10 ml-4'
                              : 'bg-muted mr-4'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-xs">
                              {msg.sender === 'user' ? 'You' : 'Support Team'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(msg.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p>{msg.message}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Reply Input */}
                  {selectedTicket.status !== 'closed' && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your reply..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                      />
                      <Button size="icon" onClick={handleReply}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select a ticket to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MemberSupportPanel;
