'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { 
  Search, Bell, LogOut, Trash2, ChevronLeft, ChevronRight, Mail,
  User, Calendar, MessageSquare, Shield, Loader2, Home, Paperclip // Added Paperclip
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// --- Updated Complaint type ---
interface Complaint {
  id: number;
  created_at: string;
  name: string;
  email: string;
  subject: string;
  complaint: string;
  is_new: boolean;
  attachment_url?: string | null; // <-- Added optional attachment URL
}

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [complaintToDelete, setComplaintToDelete] = useState<Complaint | null>(null);
  const router = useRouter();
  const complaintsPerPage = 6;

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
      if (error) toast.error(`Error fetching data: ${error.message}`);
      else setComplaints(data || []);
      setIsLoading(false);
    };
    fetchInitialData();
    const channel = supabase.channel('realtime-complaints')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, (payload) => {
        // Refetch all data on any change to keep things simple and consistent
        fetchInitialData(); 
        if (payload.eventType === 'INSERT') {
          toast.info('A new complaint has arrived!');
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);
  
  const markAsRead = async (id: number) => {
    const { error } = await supabase.from('complaints').update({ is_new: false }).eq('id', id);
    if (error) toast.error(`Error marking as read: ${error.message}`);
    else setComplaints(prev => prev.map(c => c.id === id ? { ...c, is_new: false } : c));
  };

  const deleteComplaint = async (id: number) => {
    const complaint = complaints.find(c => c.id === id);
    // First, delete the file from storage if it exists
    if (complaint?.attachment_url) {
        const fileName = complaint.attachment_url.split('/').pop();
        if (fileName) {
            await supabase.storage.from('complaint-attachments').remove([fileName]);
        }
    }
    // Then, delete the complaint record
    const { error } = await supabase.from('complaints').delete().eq('id', id);
    if (error) toast.error(`Failed to delete complaint: ${error.message}`);
    else {
      setComplaints(prev => prev.filter(c => c.id !== id));
      toast.success('Complaint deleted successfully');
    }
    setComplaintToDelete(null);
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/');
  };
  
  const filteredComplaints = complaints
    .filter(c => !showUnreadOnly || c.is_new)
    .filter(c => 
      c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.complaint.toLowerCase().includes(searchTerm.toLowerCase())
    );
  const paginatedComplaints = filteredComplaints.slice((currentPage - 1) * complaintsPerPage, currentPage * complaintsPerPage);
  const totalPages = Math.ceil(filteredComplaints.length / complaintsPerPage);
  const unreadCount = complaints.filter(c => c.is_new).length;

  if (isLoading) {
    return ( <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /><p className="ml-4 text-gray-600">Loading complaints...</p></div> );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center"><Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mr-2" /><h1 className="text-lg sm:text-xl font-semibold text-gray-900">Admin Dashboard</h1></div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Button variant="outline" size="sm" onClick={() => router.push('/')}><Home className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Home</span></Button>
                <Button variant="ghost" size="icon" onClick={() => setShowUnreadOnly(!showUnreadOnly)} className={`relative rounded-full transition-colors ${showUnreadOnly ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'text-gray-600 hover:bg-gray-100'}`}><Bell className="w-5 h-5" />{unreadCount > 0 && (<Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 h-5 rounded-full flex items-center justify-center border-2 border-white">{unreadCount}</Badge>)}</Button>
                <Button variant="destructive" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Logout</span></Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
             <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Complaints</CardTitle><MessageSquare className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{complaints.length}</div></CardContent></Card>
             <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Unread</CardTitle><Bell className="h-4 w-4 text-red-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{unreadCount}</div></CardContent></Card>
             <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Read</CardTitle><Mail className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{complaints.length - unreadCount}</div></CardContent></Card>
          </div>
          <Card className="mb-6"><CardContent className="pt-6"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input placeholder="Search by keyword, name, email..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-10" /></div>{showUnreadOnly && (<div className="mt-4"><Badge variant="secondary">Showing unread complaints only</Badge></div>)}</CardContent></Card>
          <Card>
            <CardHeader><CardTitle>Complaints ({filteredComplaints.length})</CardTitle></CardHeader>
            <CardContent>
              {filteredComplaints.length === 0 ? (<div className="text-center py-12"><MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" /><p className="text-gray-500">No complaints found.</p></div>) : (<div className="space-y-4">{paginatedComplaints.map((complaint) => (<div key={complaint.id} className={`p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer ${complaint.is_new ? 'bg-blue-50 border-blue-200' : 'bg-white'}`} onClick={() => complaint.is_new && markAsRead(complaint.id)}><div className="flex justify-between items-start mb-3"><div className="flex-1 pr-4"><div className="flex items-center gap-3 mb-2"><h3 className="font-semibold text-gray-900">{complaint.subject}</h3>{complaint.is_new && <Badge variant="destructive">New</Badge>}</div><div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600 mb-2"><span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {complaint.name || 'Anonymous'}</span><span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {complaint.email || 'No Email'}</span><span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(complaint.created_at).toLocaleString()}</span></div></div><Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setComplaintToDelete(complaint); }} className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full h-8 w-8"><Trash2 className="w-4 h-4" /></Button></div><p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{complaint.complaint}</p>
              {/* --- NEW: Attachment Link --- */}
              {complaint.attachment_url && (
                <div className="mt-4 pt-3 border-t">
                  <Button asChild variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                    <a href={complaint.attachment_url} target="_blank" rel="noopener noreferrer">
                      <Paperclip className="w-4 h-4 mr-2" />
                      View Attachment
                    </a>
                  </Button>
                </div>
              )}
              </div>))}</div>)}
              {totalPages > 1 && (<div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t gap-4 sm:gap-0"><p className="text-sm text-gray-600">Page {currentPage} of {totalPages}</p><div className="flex space-x-2"><Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="w-4 h-4 mr-1" /> Previous</Button><Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next <ChevronRight className="w-4 h-4 ml-1" /></Button></div></div>)}
            </CardContent>
          </Card>
        </main>
      </div>
      
      <AlertDialog open={complaintToDelete !== null} onOpenChange={() => setComplaintToDelete(null)}>
        <AlertDialogContent className="w-[90vw] max-w-lg rounded-lg">
          <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the complaint titled "{complaintToDelete?.subject}" from the database.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel onClick={() => setComplaintToDelete(null)}>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteComplaint(complaintToDelete!.id)} className="bg-red-600 hover:bg-red-700">Yes, delete it</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}