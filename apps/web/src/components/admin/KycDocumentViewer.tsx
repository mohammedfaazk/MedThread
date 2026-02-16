'use client'

import { useState } from 'react'
import { X, Download, ZoomIn, ZoomOut, FileText, Image as ImageIcon } from 'lucide-react'

interface KycDocumentViewerProps {
  documents: {
    idProof?: { url: string; filename: string };
    medicalDegree?: { url: string; filename: string };
    licenseDocument?: { url: string; filename: string };
    additionalCertificates?: Array<{ url: string; filename: string }>;
  };
  onClose: () => void;
}

export default function KycDocumentViewer({ documents, onClose }: KycDocumentViewerProps) {
  const [activeDoc, setActiveDoc] = useState<string>('idProof')
  const [zoom, setZoom] = useState(100)

  const getDocumentUrl = (docType: string) => {
    switch (docType) {
      case 'idProof':
        return documents.idProof?.url
      case 'medicalDegree':
        return documents.medicalDegree?.url
      case 'licenseDocument':
        return documents.licenseDocument?.url
      default:
        return documents.additionalCertificates?.[parseInt(docType.split('-')[1])]?.url
    }
  }

  const getDocumentName = (docType: string) => {
    switch (docType) {
      case 'idProof':
        return 'ID Proof'
      case 'medicalDegree':
        return 'Medical Degree'
      case 'licenseDocument':
        return 'License Document'
      default:
        return `Certificate ${parseInt(docType.split('-')[1]) + 1}`
    }
  }

  const isPdf = (url?: string) => {
    return url?.toLowerCase().endsWith('.pdf')
  }

  const handleDownload = (url?: string, filename?: string) => {
    if (!url) return
    const link = document.createElement('a')
    link.href = url
    link.download = filename || 'document'
    link.click()
  }

  const documentTypes = [
    { key: 'idProof', label: 'ID Proof', available: !!documents.idProof },
    { key: 'medicalDegree', label: 'Medical Degree', available: !!documents.medicalDegree },
    { key: 'licenseDocument', label: 'License', available: !!documents.licenseDocument },
    ...(documents.additionalCertificates || []).map((_, index) => ({
      key: `cert-${index}`,
      label: `Certificate ${index + 1}`,
      available: true
    }))
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">KYC Documents</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Documents</h3>
            <div className="space-y-2">
              {documentTypes.map(doc => (
                doc.available && (
                  <button
                    key={doc.key}
                    onClick={() => setActiveDoc(doc.key)}
                    className={`w-full text-left p-3 rounded-lg transition flex items-center gap-2 ${
                      activeDoc === doc.key
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {isPdf(getDocumentUrl(doc.key)) ? (
                      <FileText className="w-4 h-4" />
                    ) : (
                      <ImageIcon className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">{doc.label}</span>
                  </button>
                )
              ))}
            </div>
          </div>

          {/* Document Viewer */}
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900">{getDocumentName(activeDoc)}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom(Math.max(50, zoom - 10))}
                  className="p-2 hover:bg-gray-200 rounded-lg transition"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 min-w-[60px] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={() => setZoom(Math.min(200, zoom + 10))}
                  className="p-2 hover:bg-gray-200 rounded-lg transition"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-2"></div>
                <button
                  onClick={() => handleDownload(getDocumentUrl(activeDoc), getDocumentName(activeDoc))}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>

            {/* Document Display */}
            <div className="flex-1 overflow-auto bg-gray-100 p-4">
              <div className="flex items-center justify-center min-h-full">
                {isPdf(getDocumentUrl(activeDoc)) ? (
                  <div className="bg-white rounded-lg shadow-lg p-4 max-w-4xl w-full">
                    <iframe
                      src={getDocumentUrl(activeDoc)}
                      className="w-full h-[600px] border-0"
                      title={getDocumentName(activeDoc)}
                    />
                  </div>
                ) : (
                  <img
                    src={getDocumentUrl(activeDoc)}
                    alt={getDocumentName(activeDoc)}
                    style={{ transform: `scale(${zoom / 100})` }}
                    className="max-w-full h-auto rounded-lg shadow-lg transition-transform"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Review all documents carefully before approving verification
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
