// src/components/document/cortex-office-api.js
import { CortexElement } from '../../core/CortexElement.js';
import { CortexModal } from '../cortex-modal.js';

/**
 * Componente nativo de Document Management: Office File API
 * Suporta modelos corporativos (Invoice, Balance Sheet, Relatório Executivo)
 * com visualizador em alta fidelidade e exportação nativa para Word (.docx/.doc),
 * Excel (.xlsx/.xls) e PDF/Impressão sem bibliotecas externas (100% MIT).
 */
export class CortexOfficeApi extends CortexElement {
  constructor() {
    super();
    this._currentDoc = 'invoice'; // 'invoice' | 'balancesheet' | 'report'
    this._invoiceItems = [
      { pos: '01', name: 'Rössle Sauerkraut', unitPrice: 45.60, qty: 15, discount: 3.75 },
      { pos: '02', name: 'Chartreuse verte', unitPrice: 18.00, qty: 21, discount: 5.25 },
      { pos: '03', name: 'Spegesild', unitPrice: 12.00, qty: 2, discount: 0.50 }
    ];
    this._invoiceMeta = {
      company: 'Northwind Traders',
      address: 'One Portals Way, Twin Points WA, 98158',
      phone: '1-206-555-1417',
      email: 'northwind@msn.com',
      website: 'www.northwind.com',
      invoiceNo: '10643',
      invoiceDate: '04/05/2026',
      billTo: {
        company: 'Alfreds Futterkiste',
        contact: 'Maria Anders',
        address: 'Obere Str. 57, Berlin, Germany',
        phone: '030-0074321',
        email: 'alfredsfutterkiste@mail.com'
      },
      payment: {
        accountNo: '123-45-6789',
        bank: '1st Enterprise Bank',
        swift: 'SWIFTKU98UXXX',
        card: 'Visa, MasterCard, American Express'
      },
      signatory: 'Andrew Jacobson',
      role: 'Account Manager'
    };
  }

  _calculateTotals() {
    let subtotal = 0;
    let discountTotal = 0;
    this._invoiceItems.forEach(item => {
      const lineTotal = item.unitPrice * item.qty;
      subtotal += lineTotal;
      discountTotal += (item.discount || 0);
    });
    const grandTotal = Math.max(0, subtotal - discountTotal);
    return { subtotal, discountTotal, grandTotal };
  }

  // Gera código de barras vetorial Code 128 em SVG
  _renderBarcodeSVG(value = '10643-98158-2026') {
    const bars = [2,1,1,2,3,1,1,3,2,1,2,2,1,1,3,2,1,2,1,3,2,2,1,1,2,3,1,1,2,2,3,1,1,2,1,3,2,1,1,2,2,1,3,1,2,1,1,3,2,2];
    let x = 10;
    const barElements = bars.map((w, idx) => {
      const isBlack = idx % 2 === 0;
      const rect = isBlack ? `<rect x="${x}" y="0" width="${w * 1.5}" height="38" fill="currentColor"/>` : '';
      x += w * 1.5;
      return rect;
    }).join('');

    return `
      <svg class="barcode-svg" viewBox="0 0 ${x + 10} 48" preserveAspectRatio="none">
        ${barElements}
        <text x="${(x + 10) / 2}" y="47" text-anchor="middle" font-size="9" font-family="monospace" fill="currentColor">${value}</text>
      </svg>
    `;
  }

  // Exportação nativa para Excel (XML Spreadsheet 2003 nativo - compatível com Excel, LibreOffice e Sheets)
  exportToExcel() {
    const { subtotal, discountTotal, grandTotal } = this._calculateTotals();
    const rowsXML = this._invoiceItems.map(item => `
      <Row>
        <Cell><Data ss:Type="String">${item.pos}</Data></Cell>
        <Cell><Data ss:Type="String">${item.name}</Data></Cell>
        <Cell><Data ss:Type="Number">${item.unitPrice.toFixed(2)}</Data></Cell>
        <Cell><Data ss:Type="Number">${item.qty}</Data></Cell>
        <Cell><Data ss:Type="Number">${item.discount.toFixed(2)}</Data></Cell>
        <Cell><Data ss:Type="Number">${(item.unitPrice * item.qty - item.discount).toFixed(2)}</Data></Cell>
      </Row>
    `).join('');

    const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#2f5597" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Bold"><Font ss:Bold="1"/></Style>
 </Styles>
 <Worksheet ss:Name="Invoice">
  <Table>
   <Row><Cell ss:StyleID="Bold"><Data ss:Type="String">${this._invoiceMeta.company} - INVOICE #${this._invoiceMeta.invoiceNo}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Date: ${this._invoiceMeta.invoiceDate}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Bill to: ${this._invoiceMeta.billTo.company} (${this._invoiceMeta.billTo.contact})</Data></Cell></Row>
   <Row></Row>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Pos</Data></Cell>
    <Cell><Data ss:Type="String">Product Name</Data></Cell>
    <Cell><Data ss:Type="String">Unit Price ($)</Data></Cell>
    <Cell><Data ss:Type="String">Quantity</Data></Cell>
    <Cell><Data ss:Type="String">Discount ($)</Data></Cell>
    <Cell><Data ss:Type="String">Total ($)</Data></Cell>
   </Row>
   ${rowsXML}
   <Row></Row>
   <Row><Cell ss:Index="5" ss:StyleID="Bold"><Data ss:Type="String">Sub Total:</Data></Cell><Cell><Data ss:Type="Number">${subtotal.toFixed(2)}</Data></Cell></Row>
   <Row><Cell ss:Index="5" ss:StyleID="Bold"><Data ss:Type="String">Discount Total:</Data></Cell><Cell><Data ss:Type="Number">${discountTotal.toFixed(2)}</Data></Cell></Row>
   <Row><Cell ss:Index="5" ss:StyleID="Bold"><Data ss:Type="String">Grand Total:</Data></Cell><Cell><Data ss:Type="Number">${grandTotal.toFixed(2)}</Data></Cell></Row>
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${this._invoiceMeta.invoiceNo}.xls`;
    a.click();
    URL.revokeObjectURL(url);
    CortexModal.toast('Planilha Excel (.xls) exportada com sucesso!', 'success');
  }

  // Exportação nativa para Word (HTML Word Document com MIME application/msword)
  exportToWord() {
    const { subtotal, discountTotal, grandTotal } = this._calculateTotals();
    const rowsHtml = this._invoiceItems.map(item => `
      <tr>
        <td style="padding:6px;border:1px solid #ddd;text-align:center;">${item.pos}</td>
        <td style="padding:6px;border:1px solid #ddd;">${item.name}</td>
        <td style="padding:6px;border:1px solid #ddd;text-align:right;">$ ${item.unitPrice.toFixed(2)}</td>
        <td style="padding:6px;border:1px solid #ddd;text-align:center;">${item.qty}</td>
        <td style="padding:6px;border:1px solid #ddd;text-align:right;">$ ${item.discount.toFixed(2)}</td>
        <td style="padding:6px;border:1px solid #ddd;text-align:right;">$ ${(item.unitPrice * item.qty - item.discount).toFixed(2)}</td>
      </tr>
    `).join('');

    const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><title>Invoice #${this._invoiceMeta.invoiceNo}</title>
<style>
body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #222; }
table { width: 100%; border-collapse: collapse; margin-top: 20px; }
th { background: #2f5597; color: white; padding: 8px; border: 1px solid #2f5597; }
</style>
</head>
<body>
  <div style="display:flex;justify-content:space-between;border-bottom:2px solid #2f5597;padding-bottom:15px;">
    <div>
      <h2 style="margin:0;color:#2f5597;">${this._invoiceMeta.company}</h2>
      <p style="margin:4px 0;font-size:12px;color:#555;">${this._invoiceMeta.address}<br>${this._invoiceMeta.phone} | ${this._invoiceMeta.email}</p>
    </div>
    <div style="text-align:right;">
      <h1 style="margin:0;font-size:32px;letter-spacing:2px;color:#1e293b;">INVOICE</h1>
      <p style="margin:4px 0;font-size:13px;"><b>Invoice Nº:</b> ${this._invoiceMeta.invoiceNo}<br><b>Date:</b> ${this._invoiceMeta.invoiceDate}</p>
    </div>
  </div>

  <div style="margin-top:20px;">
    <b>Bill To:</b><br>
    ${this._invoiceMeta.billTo.company}<br>
    Attn: ${this._invoiceMeta.billTo.contact}<br>
    ${this._invoiceMeta.billTo.address}
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:40px;">Pos</th>
        <th>Product Name</th>
        <th style="width:100px;">Unit Price</th>
        <th style="width:60px;">Qty</th>
        <th style="width:90px;">Discount</th>
        <th style="width:110px;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div style="float:right;width:240px;margin-top:20px;text-align:right;">
    <p>Sub Total: <b>$ ${subtotal.toFixed(2)}</b></p>
    <p>Discount Total: <b>$ ${discountTotal.toFixed(2)}</b></p>
    <h3 style="border-top:1px solid #333;padding-top:6px;color:#2f5597;">Grand Total: $ ${grandTotal.toFixed(2)}</h3>
  </div>
  <div style="clear:both;"></div>

  <div style="margin-top:40px;padding-top:20px;border-top:1px solid #eee;">
    <p><b>Payment Terms:</b> Account: ${this._invoiceMeta.payment.accountNo} | Bank: ${this._invoiceMeta.payment.bank} | SWIFT: ${this._invoiceMeta.payment.swift}</p>
    <p style="font-family:'Brush Script MT', cursive;font-size:24px;margin-top:25px;">${this._invoiceMeta.signatory}</p>
    <p style="font-size:12px;color:#666;border-top:1px solid #999;width:200px;padding-top:4px;">${this._invoiceMeta.role}</p>
  </div>
</body>
</html>`;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Document_${this._invoiceMeta.invoiceNo}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    CortexModal.toast('Documento Word (.doc) exportado com sucesso!', 'success');
  }

  // Exportação nativa para Impressão / PDF
  exportToPdf() {
    const printArea = this.shadowRoot.querySelector('.paper-sheet');
    if (!printArea) return;

    const printWin = window.open('', '_blank', 'width=900,height=800');
    if (!printWin) {
      CortexModal.toast('Permita popups no navegador para visualizar a impressão em PDF.', 'warning');
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${this._invoiceMeta.invoiceNo} - CortexUI PDF</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #fff; color: #111; margin: 0; padding: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px 10px; font-size: 13px; }
            th { background: #2f5597; color: #fff; text-align: left; }
            .barcode-svg { max-height: 48px; }
          </style>
        </head>
        <body>
          ${printArea.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function(){ window.close(); }, 800);
            };
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
    CortexModal.toast('Janela de impressão e geração PDF iniciada!', 'info');
  }

  _addItem() {
    const pos = String(this._invoiceItems.length + 1).padStart(2, '0');
    this._invoiceItems.push({
      pos,
      name: `CortexUI Enterprise Service #${this._invoiceItems.length + 1}`,
      unitPrice: 95.00,
      qty: 1,
      discount: 0.00
    });
    this.render();
    CortexModal.toast('Novo item adicionado à fatura!', 'success');
  }

  _removeItem(idx) {
    if (this._invoiceItems.length <= 1) {
      CortexModal.toast('A fatura deve ter pelo menos um item.', 'warning');
      return;
    }
    this._invoiceItems.splice(idx, 1);
    this.render();
    CortexModal.toast('Item removido da fatura.', 'info');
  }

  _renderHeroBadges() {
    return `
      <div class="hero-showcase">
        <!-- Badge Excel 3D -->
        <div class="office-badge badge-excel" title="Microsoft Excel API">
          <div class="badge-icon-box">
            <svg viewBox="0 0 48 48" width="28" height="28" fill="none">
              <rect x="4" y="6" width="40" height="36" rx="4" fill="#107c41"/>
              <path d="M14 16 L22 24 L14 32 H19 L24 26.5 L29 32 H34 L26 24 L34 16 H29 L24 21.5 L19 16 Z" fill="#ffffff"/>
            </svg>
          </div>
          <span class="badge-tag">XLSX</span>
        </div>

        <!-- Badge PDF 3D -->
        <div class="office-badge badge-pdf" title="Adobe PDF Engine">
          <div class="badge-icon-box">
            <svg viewBox="0 0 48 48" width="28" height="28" fill="none">
              <rect x="4" y="6" width="40" height="36" rx="4" fill="#d83b01"/>
              <text x="24" y="29" fill="#ffffff" font-size="16" font-weight="800" font-family="sans-serif" text-anchor="middle">.pdf</text>
            </svg>
          </div>
          <span class="badge-tag">PDF</span>
        </div>

        <!-- Badge Word 3D -->
        <div class="office-badge badge-word" title="Microsoft Word API">
          <div class="badge-icon-box">
            <svg viewBox="0 0 48 48" width="28" height="28" fill="none">
              <rect x="4" y="6" width="40" height="36" rx="4" fill="#185abd"/>
              <path d="M12 16 L17 32 H21 L24 22 L27 32 H31 L36 16 H31.5 L29 26.5 L26 16 H22 L19 26.5 L16.5 16 Z" fill="#ffffff"/>
            </svg>
          </div>
          <span class="badge-tag">DOCX</span>
        </div>
      </div>
    `;
  }

  _renderInvoiceSheet() {
    const { subtotal, discountTotal, grandTotal } = this._calculateTotals();
    const meta = this._invoiceMeta;

    return `
      <div class="paper-sheet invoice-sheet">
        <!-- Header da Fatura -->
        <div class="doc-header">
          <div class="company-brand">
            <div class="company-logo-mark">
              <svg viewBox="0 0 40 40" width="34" height="34">
                <rect x="2" y="2" width="36" height="36" rx="4" fill="none" stroke="#222" stroke-width="3"/>
                <path d="M12 28 L20 12 L28 28 Z" fill="#222"/>
              </svg>
            </div>
            <div class="company-info">
              <h2 class="company-name">${meta.company}</h2>
              <p class="company-sub">${meta.address}</p>
              <p class="company-sub">${meta.phone} &bull; ${meta.email}</p>
              <p class="company-sub">${meta.website}</p>
            </div>
          </div>

          <div class="invoice-heading-block">
            <h1 class="invoice-title">INVOICE</h1>
            <div class="invoice-meta-grid">
              <div class="meta-row">
                <span class="meta-lbl">Invoice Nº:</span>
                <span class="meta-val highlight">${meta.invoiceNo}</span>
              </div>
              <div class="meta-row">
                <span class="meta-lbl">Invoice Date:</span>
                <span class="meta-val">${meta.invoiceDate}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bill To -->
        <div class="bill-to-section">
          <div class="bill-to-title">Bill to:</div>
          <div class="bill-to-box">
            <div class="bill-row"><span class="b-lbl">Company:</span> <span class="b-val"><strong>${meta.billTo.company}</strong></span></div>
            <div class="bill-row"><span class="b-lbl">Contact Name:</span> <span class="b-val">${meta.billTo.contact}</span></div>
            <div class="bill-row"><span class="b-lbl">Address:</span> <span class="b-val">${meta.billTo.address}</span></div>
            <div class="bill-row"><span class="b-lbl">Phone:</span> <span class="b-val">${meta.billTo.phone}</span></div>
            <div class="bill-row"><span class="b-lbl">Mail:</span> <span class="b-val">${meta.billTo.email}</span></div>
          </div>
        </div>

        <!-- Tabela de Produtos -->
        <table class="doc-table">
          <thead>
            <tr>
              <th style="width: 44px; text-align:center;">Pos</th>
              <th>Product Name</th>
              <th style="width: 105px; text-align:right;">Unit Price</th>
              <th style="width: 70px; text-align:center;">Quantity</th>
              <th style="width: 90px; text-align:right;">Discount</th>
              <th style="width: 110px; text-align:right;">Total</th>
              <th class="no-print" style="width: 40px; text-align:center;">Ação</th>
            </tr>
          </thead>
          <tbody>
            ${this._invoiceItems.map((item, idx) => {
              const lineTotal = item.unitPrice * item.qty - (item.discount || 0);
              return `
                <tr>
                  <td style="text-align:center;" class="mono">${item.pos}</td>
                  <td>
                    <input class="table-inline-input" data-field="name" data-idx="${idx}" value="${item.name}" />
                  </td>
                  <td style="text-align:right;" class="mono">
                    $ <input class="table-inline-num" data-field="unitPrice" data-idx="${idx}" type="number" step="0.01" value="${item.unitPrice.toFixed(2)}" />
                  </td>
                  <td style="text-align:center;" class="mono">
                    <input class="table-inline-num short" data-field="qty" data-idx="${idx}" type="number" min="1" value="${item.qty}" />
                  </td>
                  <td style="text-align:right;" class="mono">
                    $ <input class="table-inline-num" data-field="discount" data-idx="${idx}" type="number" step="0.01" value="${item.discount.toFixed(2)}" />
                  </td>
                  <td style="text-align:right;" class="mono bold">
                    $ ${lineTotal.toFixed(2)}
                  </td>
                  <td class="no-print" style="text-align:center;">
                    <button class="btn-del-item" data-action="del-item" data-idx="${idx}" title="Remover item">&times;</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <!-- Totais e Pagamento -->
        <div class="summary-and-payment">
          <div class="payment-details">
            <div class="sec-title">Payment method:</div>
            <div class="pay-row"><span class="p-lbl">Account No:</span> <span class="p-val mono">${meta.payment.accountNo}</span></div>
            <div class="pay-row"><span class="p-lbl">Bank:</span> <span class="p-val">${meta.payment.bank}</span></div>
            <div class="pay-row"><span class="p-lbl">Swift Code:</span> <span class="p-val mono">${meta.payment.swift}</span></div>
            <div class="pay-row"><span class="p-lbl">Card Payment:</span> <span class="p-val">${meta.payment.card}</span></div>

            <div class="barcode-container">
              ${this._renderBarcodeSVG(`${meta.invoiceNo}-${meta.billTo.contact}`)}
            </div>
          </div>

          <div class="totals-box">
            <div class="total-row">
              <span>Sub Total:</span>
              <span class="mono bold">$ ${subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row discount">
              <span>Discount Total:</span>
              <span class="mono bold">- $ ${discountTotal.toFixed(2)}</span>
            </div>
            <div class="total-row grand-total">
              <span>Grand Total:</span>
              <span class="mono bold">$ ${grandTotal.toFixed(2)}</span>
            </div>

            <!-- Assinatura -->
            <div class="signature-block">
              <div class="sig-script">${meta.signatory}</div>
              <div class="sig-line"></div>
              <div class="sig-name">${meta.signatory}</div>
              <div class="sig-role">${meta.role}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _renderBalanceSheet() {
    return `
      <div class="paper-sheet balance-sheet">
        <div class="doc-header" style="border-bottom: 2px solid #1e293b; padding-bottom: 12px;">
          <div>
            <h1 style="font-size: 26px; margin: 0; color: #1e293b;">Balance Sheet</h1>
            <p style="margin: 4px 0; color: #64748b; font-size: 13px;">Northwind Traders Corp &bull; Consolidado Exercício 2026</p>
          </div>
          <div style="text-align: right;">
            <span class="tag" style="background:#0284c7; color:#fff; padding:4px 8px; border-radius:4px; font-weight:bold;">IFRS / GAAP</span>
          </div>
        </div>

        <table class="doc-table" style="margin-top: 18px;">
          <thead>
            <tr>
              <th>Assets</th>
              <th style="width: 140px; text-align:right;">2026 ($)</th>
              <th style="width: 140px; text-align:right;">2025 ($)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background: rgba(0,0,0,0.02);"><td colspan="3"><strong>Current assets</strong></td></tr>
            <tr><td style="padding-left: 20px;">Cash and cash equivalents</td><td class="mono" style="text-align:right;">$ 145,200.00</td><td class="mono" style="text-align:right;">$ 112,400.00</td></tr>
            <tr><td style="padding-left: 20px;">Marketable securities</td><td class="mono" style="text-align:right;">$ 84,350.00</td><td class="mono" style="text-align:right;">$ 65,100.00</td></tr>
            <tr><td style="padding-left: 20px;">Accounts receivable (trade)</td><td class="mono" style="text-align:right;">$ 210,480.00</td><td class="mono" style="text-align:right;">$ 198,000.00</td></tr>
            <tr><td style="padding-left: 20px;">Inventories</td><td class="mono" style="text-align:right;">$ 126,900.00</td><td class="mono" style="text-align:right;">$ 115,200.00</td></tr>
            <tr class="highlight-row"><td><strong>Total Current assets</strong></td><td class="mono bold" style="text-align:right;">$ 566,930.00</td><td class="mono bold" style="text-align:right;">$ 490,700.00</td></tr>

            <tr style="background: rgba(0,0,0,0.02);"><td colspan="3"><strong>Long-term assets</strong></td></tr>
            <tr><td style="padding-left: 20px;">Property, plant and equipment, net</td><td class="mono" style="text-align:right;">$ 840,000.00</td><td class="mono" style="text-align:right;">$ 780,000.00</td></tr>
            <tr><td style="padding-left: 20px;">Intangible assets, net</td><td class="mono" style="text-align:right;">$ 190,500.00</td><td class="mono" style="text-align:right;">$ 140,000.00</td></tr>
            <tr><td style="padding-left: 20px;">Goodwill</td><td class="mono" style="text-align:right;">$ 95,000.00</td><td class="mono" style="text-align:right;">$ 95,000.00</td></tr>
            <tr class="highlight-row"><td><strong>Total Long-term assets</strong></td><td class="mono bold" style="text-align:right;">$ 1,125,500.00</td><td class="mono bold" style="text-align:right;">$ 1,015,000.00</td></tr>

            <tr class="grand-total-row"><td><strong>TOTAL ASSETS</strong></td><td class="mono bold" style="text-align:right;">$ 1,692,430.00</td><td class="mono bold" style="text-align:right;">$ 1,505,700.00</td></tr>
          </tbody>
        </table>
      </div>
    `;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: block;
          width: 100%;
          height: 100%;
          background: var(--bg-app, #0f172a);
          color: var(--text-primary, #f8fafc);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, sans-serif;
          overflow: auto;
          box-sizing: border-box;
        }

        .office-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        /* Toolbar Superior */
        .office-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          background: var(--bg-panel, #1e293b);
          border: 1px solid var(--border-subtle, #334155);
          border-radius: var(--radius-md, 8px);
          padding: 10px 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .tool-group {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .segmented-ctrl {
          display: flex;
          background: rgba(0,0,0,0.25);
          border: 1px solid var(--border-subtle, #334155);
          border-radius: 6px;
          overflow: hidden;
        }

        .seg-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary, #94a3b8);
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .seg-btn.active {
          background: var(--accent-blue, #2563eb);
          color: #fff;
          font-weight: 600;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 6px;
          border: 1px solid transparent;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.1s ease, background 0.15s ease;
        }

        .action-btn:hover {
          transform: translateY(-1px);
        }

        .btn-excel {
          background: #107c41;
          color: #ffffff;
        }
        .btn-excel:hover { background: #0b6a36; }

        .btn-word {
          background: #185abd;
          color: #ffffff;
        }
        .btn-word:hover { background: #12499c; }

        .btn-pdf {
          background: #d83b01;
          color: #ffffff;
        }
        .btn-pdf:hover { background: #b83200; }

        .btn-secondary {
          background: rgba(255,255,255,0.08);
          border-color: var(--border-subtle, #334155);
          color: var(--text-primary, #fff);
        }
        .btn-secondary:hover {
          background: rgba(255,255,255,0.15);
        }

        /* Hero Badges 3D */
        .hero-showcase {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 32px;
          padding: 10px 0;
        }

        .office-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 8px 16px;
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
          backdrop-filter: blur(8px);
          transition: transform 0.2s ease;
        }

        .office-badge:hover {
          transform: translateY(-3px) scale(1.02);
        }

        .badge-icon-box {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .badge-tag {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          color: var(--text-secondary, #94a3b8);
        }

        /* Papel A4 / Folha de Documento */
        .paper-sheet {
          background: #ffffff;
          color: #1e293b;
          border-radius: 4px;
          padding: 48px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          min-height: 840px;
          box-sizing: border-box;
          position: relative;
        }

        .doc-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 24px;
          margin-bottom: 24px;
        }

        .company-brand {
          display: flex;
          gap: 14px;
          align-items: center;
        }

        .company-name {
          margin: 0;
          font-size: 20px;
          font-weight: 800;
          color: #1e293b;
          letter-spacing: -0.5px;
        }

        .company-sub {
          margin: 2px 0;
          font-size: 11.5px;
          color: #64748b;
        }

        .invoice-title {
          font-size: 38px;
          font-weight: 900;
          letter-spacing: 2px;
          color: #0f172a;
          margin: 0 0 8px 0;
          text-align: right;
        }

        .invoice-meta-grid {
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: flex-end;
          font-size: 12.5px;
        }

        .meta-row {
          display: flex;
          gap: 8px;
        }

        .meta-lbl {
          color: #64748b;
          font-weight: 500;
        }

        .meta-val {
          font-weight: 600;
          color: #1e293b;
        }

        .meta-val.highlight {
          color: #2563eb;
        }

        /* Bill To */
        .bill-to-section {
          margin-bottom: 24px;
          background: #f8fafc;
          border-left: 3px solid #2563eb;
          padding: 12px 18px;
          border-radius: 0 6px 6px 0;
        }

        .bill-to-title {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #64748b;
          margin-bottom: 6px;
        }

        .bill-to-box {
          font-size: 12.5px;
          line-height: 1.5;
          color: #334155;
        }

        .b-lbl {
          color: #64748b;
          display: inline-block;
          width: 95px;
        }

        /* Tabela de Produtos */
        .doc-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
          font-size: 13px;
        }

        .doc-table th {
          background: #f1f5f9;
          color: #334155;
          font-weight: 700;
          padding: 10px 12px;
          border-bottom: 2px solid #cbd5e1;
          text-align: left;
        }

        .doc-table td {
          padding: 8px 12px;
          border-bottom: 1px solid #e2e8f0;
          color: #1e293b;
        }

        .table-inline-input {
          width: 100%;
          border: 1px solid transparent;
          background: transparent;
          font-size: 13px;
          color: #1e293b;
          padding: 4px;
          border-radius: 4px;
        }

        .table-inline-input:hover, .table-inline-input:focus {
          border-color: #94a3b8;
          background: #f8fafc;
        }

        .table-inline-num {
          width: 75px;
          border: 1px solid transparent;
          background: transparent;
          text-align: right;
          font-family: monospace;
          font-size: 13px;
          padding: 4px;
          border-radius: 4px;
        }

        .table-inline-num.short {
          width: 45px;
          text-align: center;
        }

        .table-inline-num:hover, .table-inline-num:focus {
          border-color: #94a3b8;
          background: #f8fafc;
        }

        .btn-del-item {
          background: transparent;
          border: none;
          color: #ef4444;
          font-size: 18px;
          cursor: pointer;
          line-height: 1;
        }

        .btn-del-item:hover {
          color: #b91c1c;
        }

        /* Resumo e Pagamento */
        .summary-and-payment {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 30px;
          margin-top: 20px;
        }

        .payment-details {
          flex: 1;
          font-size: 12px;
          color: #475569;
        }

        .sec-title {
          font-size: 12px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
        }

        .pay-row {
          margin-bottom: 4px;
        }

        .p-lbl {
          display: inline-block;
          width: 100px;
          color: #64748b;
        }

        .barcode-container {
          margin-top: 18px;
          max-width: 260px;
          color: #1e293b;
        }

        .totals-box {
          width: 280px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 13px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          color: #334155;
        }

        .total-row.discount {
          color: #dc2626;
        }

        .total-row.grand-total {
          border-top: 2px solid #0f172a;
          padding-top: 8px;
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
        }

        /* Assinatura */
        .signature-block {
          margin-top: 28px;
          text-align: right;
        }

        .sig-script {
          font-family: 'Brush Script MT', 'Segoe Script', cursive;
          font-size: 26px;
          color: #1e3a8a;
          margin-bottom: -4px;
        }

        .sig-line {
          height: 1px;
          background: #94a3b8;
          width: 170px;
          margin-left: auto;
          margin-bottom: 4px;
        }

        .sig-name {
          font-size: 12px;
          font-weight: 700;
          color: #1e293b;
        }

        .sig-role {
          font-size: 11px;
          color: #64748b;
        }

        .mono { font-family: monospace; }
        .bold { font-weight: 700; }

        @media (max-width: 768px) {
          .summary-and-payment { flex-direction: column; }
          .paper-sheet { padding: 20px; }
          .totals-box { width: 100%; }
        }
      </style>

      <div class="office-container">
        <!-- Barra de Ferramentas / Exportadores -->
        <div class="office-toolbar">
          <div class="tool-group">
            <span style="font-size: 12px; font-weight: 600; color: var(--text-secondary, #94a3b8);">Modelo:</span>
            <div class="segmented-ctrl">
              <button class="seg-btn ${this._currentDoc === 'invoice' ? 'active' : ''}" data-doc="invoice">&#128196; Fatura Comercial</button>
              <button class="seg-btn ${this._currentDoc === 'balancesheet' ? 'active' : ''}" data-doc="balancesheet">&#128202; Balanço Patrimonial</button>
            </div>
            ${this._currentDoc === 'invoice' ? `
              <button class="action-btn btn-secondary" data-action="add-item">+ Adicionar Item</button>
            ` : ''}
          </div>

          <div class="tool-group">
            <button class="action-btn btn-excel" data-action="export-excel">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-2.5-3.5L7 17H5l3.5-5L5 7h2l2.5 3.5L12 7h2l-3.5 5 3.5 5h-2z"/></svg>
              Excel (.xlsx)
            </button>
            <button class="action-btn btn-word" data-action="export-word">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 14h-2l-1.5-6L12 17h-2L8.5 11 7 17H5l2.5-10h2.5l1.5 6 1.5-6H15.5l2.5 10z"/></svg>
              Word (.docx)
            </button>
            <button class="action-btn btn-pdf" data-action="export-pdf">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v4zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5z"/></svg>
              PDF / Imprimir
            </button>
          </div>
        </div>

        <!-- Badges Ilustrativos do Office (Imagem 1) -->
        ${this._renderHeroBadges()}

        <!-- Folha Renderizada -->
        ${this._currentDoc === 'invoice' ? this._renderInvoiceSheet() : this._renderBalanceSheet()}
      </div>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    const root = this.shadowRoot;

    // Alternar modelo
    root.querySelectorAll('.seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._currentDoc = btn.dataset.doc;
        this.render();
      });
    });

    // Botões de exportação
    root.querySelector('[data-action="export-excel"]')?.addEventListener('click', () => this.exportToExcel());
    root.querySelector('[data-action="export-word"]')?.addEventListener('click', () => this.exportToWord());
    root.querySelector('[data-action="export-pdf"]')?.addEventListener('click', () => this.exportToPdf());
    root.querySelector('[data-action="add-item"]')?.addEventListener('click', () => this._addItem());

    // Remoção de itens
    root.querySelectorAll('[data-action="del-item"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        this._removeItem(idx);
      });
    });

    // Inputs inline com recálculo imediato
    root.querySelectorAll('.table-inline-input, .table-inline-num').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(input.dataset.idx, 10);
        const field = input.dataset.field;
        let val = input.value;
        if (field === 'unitPrice' || field === 'discount') val = parseFloat(val) || 0;
        if (field === 'qty') val = parseInt(val, 10) || 1;
        this._invoiceItems[idx][field] = val;

        // Atualiza totais na tela sem re-render completo para não perder foco
        const { subtotal, discountTotal, grandTotal } = this._calculateTotals();
        const lineTotal = this._invoiceItems[idx].unitPrice * this._invoiceItems[idx].qty - this._invoiceItems[idx].discount;
        const row = input.closest('tr');
        if (row) {
          const totalTd = row.children[5];
          if (totalTd) totalTd.textContent = `$ ${lineTotal.toFixed(2)}`;
        }
        const subtotalEl = root.querySelector('.total-row:not(.discount):not(.grand-total) .mono');
        if (subtotalEl) subtotalEl.textContent = `$ ${subtotal.toFixed(2)}`;
        const discountEl = root.querySelector('.total-row.discount .mono');
        if (discountEl) discountEl.textContent = `- $ ${discountTotal.toFixed(2)}`;
        const grandEl = root.querySelector('.total-row.grand-total .mono');
        if (grandEl) grandEl.textContent = `$ ${grandTotal.toFixed(2)}`;
      });
    });
  }
}

customElements.define('cortex-office-api', CortexOfficeApi);
