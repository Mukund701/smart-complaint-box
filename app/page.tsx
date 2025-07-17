'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { MessageCircle, Send, Shield, Loader2, Paperclip, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function ComplaintForm() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File is too large. Maximum size is 5MB.');
        setAttachment(null);
        e.target.value = ''; // Reset file input
        return;
    }
    setAttachment(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please fill in the Subject and Message fields.');
      return;
    }
    setIsSubmitting(true);

    try {
      let attachmentUrl: string | null = null;

      if (attachment) {
        const fileExt = attachment.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('complaint-attachments')
          .upload(filePath, attachment);

        if (uploadError) {
          throw new Error(`Failed to upload file: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from('complaint-attachments')
          .getPublicUrl(filePath);
        
        attachmentUrl = urlData.publicUrl;
      }

      const { error: supabaseError } = await supabase
        .from('complaints')
        .insert([{ 
            name: formData.name, 
            email: formData.email, 
            subject: formData.subject, 
            complaint: formData.message,
            is_new: true,
            attachment_url: attachmentUrl,
        }]);

      if (supabaseError) throw supabaseError;
      toast.success('Complaint submitted successfully!');

      // --- Step 3: Send email notification ---
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // --- UPDATED: This now correctly sends the data ---
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          complaint: formData.message, // Correctly sends `message` as `complaint`
          attachmentUrl: attachmentUrl, // Also sends the attachment URL
        }),
      });

      setFormData({ name: '', email: '', subject: '', message: '' });
      setAttachment(null);
      const fileInput = document.getElementById('attachment') as HTMLInputElement;
      if(fileInput) fileInput.value = '';

    } catch (error: any) {
      console.error('Error during submission:', error);
      toast.error(`Submission failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 shadow-lg"><MessageCircle className="w-8 h-8 text-white" /></div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Smart Complaint Box</h1>
            <p className="text-md sm:text-lg text-gray-600">Submit your concerns securely and efficiently.</p>
          </div>
          <Card className="shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-blue-600" />Submit a Complaint</CardTitle><CardDescription>Your privacy is protected. Name and email are optional.</CardDescription></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="name">Name (Optional)</Label><Input id="name" placeholder="Your name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                  <div className="space-y-2"><Label htmlFor="email">Email (Optional)</Label><Input id="email" type="email" placeholder="your.email@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label htmlFor="subject">Subject *</Label><Input id="subject" placeholder="Brief description of your complaint" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required /></div>
                <div className="space-y-2"><Label htmlFor="message">Message *</Label><Textarea id="message" placeholder="Please describe your complaint in detail..." rows={6} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required /></div>
                <div className="space-y-2">
                  <Label htmlFor="attachment">Attach File (Optional, 5MB Max)</Label>
                  {!attachment ? (<label htmlFor="attachment" className="flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"><Paperclip className="w-5 h-5 mr-2 text-gray-500" /><span className="text-sm text-gray-600">Click to upload an image or PDF</span><Input id="attachment" type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" /></label>) : (<div className="flex items-center justify-between w-full p-3 border rounded-lg bg-gray-50"><span className="text-sm text-gray-800 truncate">{attachment.name}</span><Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setAttachment(null); const fi = document.getElementById('attachment') as HTMLInputElement; if(fi) fi.value = ''; }}><X className="w-4 h-4" /></Button></div>)}
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>{isSubmitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>) : (<><Send className="w-4 h-4 mr-2" />Submit Complaint</>)}</Button>
              </form>
            </CardContent>
          </Card>
          <div className="text-center mt-8"><p className="text-center text-sm text-gray-500">Are you an administrator?{' '}<button onClick={() => setLoginModalOpen(true)} className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500 underline">Login</button></p></div>
        </div>
      </div>
      <LoginModal isOpen={isLoginModalOpen} onOpenChange={setLoginModalOpen} />
    </>
  );
}

function LoginModal({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (isOpen: boolean) => void; }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const response = await fetch('/api/admin/login', { method: 'POST', body: JSON.stringify(Object.fromEntries(formData)), headers: { 'Content-Type': 'application/json' } });
    if (response.ok) {
      onOpenChange(false);
      router.push('/admin/dashboard');
    } else {
      const data = await response.json();
      setError(data.message || 'Invalid username or password.');
    }
  }
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-md rounded-lg">
        <DialogHeader><DialogTitle>Admin Login</DialogTitle><DialogDescription>Enter your credentials to access the dashboard.</DialogDescription></DialogHeader>
        <form onSubmit={handleLoginSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2"><Label htmlFor="username">Username</Label><Input id="username" name="username" type="text" required /></div>
          <div className="grid gap-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" required /></div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full">Sign In</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}