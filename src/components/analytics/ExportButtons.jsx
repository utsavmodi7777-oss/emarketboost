import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Download, FileText, Share2, Mail } from 'lucide-react';
import { exportToPDF, exportToCSV, shareReportViaEmail } from '../../utils/api';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

const ExportButtons = ({ analyticsData }) => {
  const [email, setEmail] = useState('');
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportToPDF('user-id', analyticsData);
    } catch (error) {
      console.error('Export to PDF failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      await exportToCSV('user-id', analyticsData);
    } catch (error) {
      console.error('Export to CSV failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareEmail = async () => {
    if (!email) {
      alert('Please enter an email address');
      return;
    }
    
    setIsExporting(true);
    try {
      await shareReportViaEmail('user-id', email, analyticsData);
      setIsEmailDialogOpen(false);
      setEmail('');
    } catch (error) {
      console.error('Share via email failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <Download className="h-6 w-6 text-blue-500" />
          Export & Share Reports
        </CardTitle>
        <p className="text-sm text-gray-400 mt-1">
          Download or share your analytics data
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Export to PDF */}
          <Button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white h-auto py-4 flex flex-col items-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-1"
          >
            <FileText className="h-6 w-6" />
            <span className="font-semibold">Export to PDF</span>
            <span className="text-xs opacity-80">Download complete report</span>
          </Button>

          {/* Export to CSV */}
          <Button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white h-auto py-4 flex flex-col items-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-1"
          >
            <Download className="h-6 w-6" />
            <span className="font-semibold">Export to CSV</span>
            <span className="text-xs opacity-80">Download data table</span>
          </Button>

          {/* Share via Email */}
          <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white h-auto py-4 flex flex-col items-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1"
              >
                <Mail className="h-6 w-6" />
                <span className="font-semibold">Share via Email</span>
                <span className="text-xs opacity-80">Send to inbox</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Share Report via Email</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Enter the email address where you want to send the analytics report
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Email Address</label>
                  <Input
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <Button
                  onClick={handleShareEmail}
                  disabled={isExporting || !email}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {isExporting ? 'Sending...' : 'Send Report'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-6 border-t border-gray-700/50">
          <h4 className="text-sm font-semibold text-gray-400 mb-3">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={() => window.print()}
            >
              <FileText className="h-4 w-4 mr-2" />
              Print Report
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Dashboard link copied to clipboard!');
              }}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={() => {
                const dataStr = JSON.stringify(analyticsData, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                const exportFileDefaultName = 'analytics-data.json';
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportButtons;
