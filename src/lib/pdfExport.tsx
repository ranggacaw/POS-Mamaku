import React from 'react'
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'
import { formatCurrency, formatPercentage } from './reportUtils'
import { SalesMetrics, ProductPerformance, CategoryPerformance, PaymentMethodAnalysis } from '@/types'

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 10
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 10
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 5
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingVertical: 3
  },
  label: {
    fontSize: 12,
    color: '#374151',
    flex: 1
  },
  value: {
    fontSize: 12,
    color: '#1f2937',
    fontWeight: 'bold',
    textAlign: 'right'
  },
  table: {
    marginBottom: 20
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderBottom: 1,
    borderBottomColor: '#d1d5db'
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: 1,
    borderBottomColor: '#e5e7eb'
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    color: '#374151'
  },
  tableCellHeader: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 10,
    borderTop: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10
  }
})

// Sales Report PDF Component
interface SalesReportPDFProps {
  title: string
  dateRange: string
  metrics: SalesMetrics
  productPerformance?: ProductPerformance[]
  categoryPerformance?: CategoryPerformance[]
  paymentAnalysis?: PaymentMethodAnalysis[]
}

const SalesReportPDF: React.FC<SalesReportPDFProps> = ({
  title,
  dateRange,
  metrics,
  productPerformance = [],
  categoryPerformance = [],
  paymentAnalysis = []
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>POS Mamaku - Point of Sale System</Text>
        <Text style={styles.subtitle}>Report Period: {dateRange}</Text>
        <Text style={styles.subtitle}>Generated on: {new Date().toLocaleDateString()}</Text>
      </View>

      {/* Sales Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sales Summary</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Total Sales:</Text>
          <Text style={styles.value}>{formatCurrency(metrics.totalSales)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total Orders:</Text>
          <Text style={styles.value}>{metrics.totalOrders.toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Average Order Value:</Text>
          <Text style={styles.value}>{formatCurrency(metrics.averageOrderValue)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Subtotal:</Text>
          <Text style={styles.value}>{formatCurrency(metrics.totalSubtotal)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tax Collected:</Text>
          <Text style={styles.value}>{formatCurrency(metrics.totalTax)}</Text>
        </View>
      </View>

      {/* Top Products */}
      {productPerformance.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performing Products</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCellHeader}>Product</Text>
              <Text style={styles.tableCellHeader}>Category</Text>
              <Text style={styles.tableCellHeader}>Qty Sold</Text>
              <Text style={styles.tableCellHeader}>Revenue</Text>
            </View>
            {productPerformance.slice(0, 10).map((product, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{product.productName}</Text>
                <Text style={styles.tableCell}>{product.categoryName}</Text>
                <Text style={styles.tableCell}>{product.quantitySold}</Text>
                <Text style={styles.tableCell}>{formatCurrency(product.revenue)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Category Performance */}
      {categoryPerformance.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Performance</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCellHeader}>Category</Text>
              <Text style={styles.tableCellHeader}>Revenue</Text>
              <Text style={styles.tableCellHeader}>Items Sold</Text>
              <Text style={styles.tableCellHeader}>Products</Text>
            </View>
            {categoryPerformance.map((category, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{category.categoryName}</Text>
                <Text style={styles.tableCell}>{formatCurrency(category.totalRevenue)}</Text>
                <Text style={styles.tableCell}>{category.totalQuantity}</Text>
                <Text style={styles.tableCell}>{category.productCount}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Payment Methods */}
      {paymentAnalysis.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCellHeader}>Payment Method</Text>
              <Text style={styles.tableCellHeader}>Total Amount</Text>
              <Text style={styles.tableCellHeader}>Orders</Text>
              <Text style={styles.tableCellHeader}>Percentage</Text>
            </View>
            {paymentAnalysis.map((method, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{method.paymentMethod.toUpperCase()}</Text>
                <Text style={styles.tableCell}>{formatCurrency(method.totalAmount)}</Text>
                <Text style={styles.tableCell}>{method.orderCount}</Text>
                <Text style={styles.tableCell}>{formatPercentage(method.percentage)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Footer */}
      <Text style={styles.footer}>
        This report was generated automatically by POS Mamaku reporting system.
      </Text>
    </Page>
  </Document>
)

// Export functions
export const generateSalesReportPDF = async (
  title: string,
  dateRange: string,
  metrics: SalesMetrics,
  productPerformance?: ProductPerformance[],
  categoryPerformance?: CategoryPerformance[],
  paymentAnalysis?: PaymentMethodAnalysis[]
) => {
  const doc = (
    <SalesReportPDF
      title={title}
      dateRange={dateRange}
      metrics={metrics}
      productPerformance={productPerformance}
      categoryPerformance={categoryPerformance}
      paymentAnalysis={paymentAnalysis}
    />
  )

  const asPdf = pdf(doc)
  const blob = await asPdf.toBlob()
  
  // Create download link
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Product Report PDF Component
const ProductReportPDF: React.FC<{
  title: string
  dateRange: string
  productPerformance: ProductPerformance[]
  categoryPerformance: CategoryPerformance[]
  lowStockItems: any[]
}> = ({ title, dateRange, productPerformance, categoryPerformance, lowStockItems }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>POS Mamaku - Point of Sale System</Text>
        <Text style={styles.subtitle}>Report Period: {dateRange}</Text>
        <Text style={styles.subtitle}>Generated on: {new Date().toLocaleDateString()}</Text>
      </View>

      {/* Product Performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Product Performance</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellHeader}>Product</Text>
            <Text style={styles.tableCellHeader}>Category</Text>
            <Text style={styles.tableCellHeader}>Qty Sold</Text>
            <Text style={styles.tableCellHeader}>Revenue</Text>
            <Text style={styles.tableCellHeader}>Stock</Text>
          </View>
          {productPerformance.slice(0, 15).map((product, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{product.productName}</Text>
              <Text style={styles.tableCell}>{product.categoryName}</Text>
              <Text style={styles.tableCell}>{product.quantitySold}</Text>
              <Text style={styles.tableCell}>{formatCurrency(product.revenue)}</Text>
              <Text style={styles.tableCell}>{product.stock}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Low Stock Items */}
      {lowStockItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Low Stock Alert</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCellHeader}>Product</Text>
              <Text style={styles.tableCellHeader}>Category</Text>
              <Text style={styles.tableCellHeader}>Current Stock</Text>
              <Text style={styles.tableCellHeader}>Price</Text>
            </View>
            {lowStockItems.map((product, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{product.name}</Text>
                <Text style={styles.tableCell}>{product.category.name}</Text>
                <Text style={styles.tableCell}>{product.stock}</Text>
                <Text style={styles.tableCell}>{formatCurrency(product.price)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <Text style={styles.footer}>
        This report was generated automatically by POS Mamaku reporting system.
      </Text>
    </Page>
  </Document>
)

export const generateProductReportPDF = async (
  title: string,
  dateRange: string,
  productPerformance: ProductPerformance[],
  categoryPerformance: CategoryPerformance[],
  lowStockItems: any[]
) => {
  const doc = (
    <ProductReportPDF
      title={title}
      dateRange={dateRange}
      productPerformance={productPerformance}
      categoryPerformance={categoryPerformance}
      lowStockItems={lowStockItems}
    />
  )

  const asPdf = pdf(doc)
  const blob = await asPdf.toBlob()
  
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}