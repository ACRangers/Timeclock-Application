# ServiceTitan API Reference

Generated from 28 OpenAPI specs.

**Legend:** ⭐ = relevant to jobs/estimates/dispatch/history | * = required param

---

## Accounting
**Base:** `https://api.servicetitan.io/accounting/v2`
**File:** `tenant-accounting-v2.json`

### GET /tenant/{tenant}/ap-bills
Returns a paginated list of AP bills with detailed item information, filtering capabilities, and associated metadata
**Params:** `ids` — Comma-separated list of specific AP bill IDs to retrieve, `batchId` — Filter by specific batch ID, `batchNumber` — Filter by batch number, `billNumber` — Filter by bill number (partial match supported), `businessUnitIds` — Comma-separated list of business unit IDs to filter by, `customField.Fields` — Dictionary of name-value pairs, `customField.Operator` — Operator to be used between the name-value pairs. Can be "Or" or "And", default , `dateFrom` — Filter bills created on or after this date, `dateTo` — Filter bills created on or before this date, `jobNumber` — Filter by job number (partial match supported), `purchaseOrderNumber` — Filter by purchase order number (partial match supported), `purchaseOrderTypes` — Comma-separated list of purchase order types to filter by, `syncStatuses` — Filter by sync status values, `statuses` — Filter by bill status values, `sources` — Filter by bill source values, `minCost` — Filter bills with cost greater than or equal to this amount, `maxCost` — Filter bills with cost less than or equal to this amount, `billType` — Filter by bill type (defaults to Procurement)\, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `dateReconciledBefore` — Filter by bills reconciled on or before this date, `dateReconciledOnOrAfter` — Filter by bills reconciled after this date, `threeWayMatchDiscrepancy` — Filter by three-way match discrepancy status\
**Scope:** `tn.acc.apbills:r`

### ⭐ GET /tenant/{tenant}/ap-bills/custom-fields
Returns a paginated list of filtered custom field types available for AP bills
**Params:** `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort`
**Scope:** `tn.acc.apbills:r`

### ⭐ PATCH /tenant/{tenant}/ap-bills/custom-fields
Updates custom field values on multiple AP bills
**Body:** operations
**Scope:** `tn.acc.apbills:w`

### POST /tenant/{tenant}/ap-bills/markasexported
Marks multiple AP bills as exported, updating their sync status to indicate they have been exported to external systems
**Body:** billIds
**Scope:** `tn.acc.apbills:w`

### GET /tenant/{tenant}/ap-bills/{billId}
Returns a single AP bill by its unique identifier with complete details including items, expense items, and associated metadata
**Scope:** `tn.acc.apbills:r`

### GET /tenant/{tenant}/ap-credits
Gets a paginated list of ap credits
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by specified fields, `customField.Fields` — Dictionary of name-value pairs, `customField.Operator` — Operator to be used between the name-value pairs. Can be "Or" or "And", default , `syncStatuses`
**Scope:** `tn.acc.apcredits:r`

### ⭐ GET /tenant/{tenant}/ap-credits/custom-fields
Returns a paginated list of filtered custom field types available for AP credits
**Params:** `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort`
**Scope:** `tn.acc.apcredits:r`

### ⭐ PATCH /tenant/{tenant}/ap-credits/custom-fields
Updates custom field values on multiple AP credits
**Body:** operations
**Scope:** `tn.acc.apcredits:w`

### POST /tenant/{tenant}/ap-credits/markasexported
Marks ap-credits as exported.
**Body:** 0
**Scope:** `tn.acc.apcredits:w`

### GET /tenant/{tenant}/ap-payments
ApPayments_GetList
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by specified fields, `customField.Fields` — Dictionary of name-value pairs, `customField.Operator` — Operator to be used between the name-value pairs. Can be "Or" or "And", default , `syncStatuses`
**Scope:** `tn.acc.appayments:r`

### ⭐ GET /tenant/{tenant}/ap-payments/custom-fields
Returns a paginated list of filtered custom field types available for AP payments
**Params:** `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort`
**Scope:** `tn.acc.appayments:r`

### ⭐ PATCH /tenant/{tenant}/ap-payments/custom-fields
Updates custom field values on multiple AP payments
**Body:** operations
**Scope:** `tn.acc.appayments:w`

### POST /tenant/{tenant}/ap-payments/markasexported
Marks ap-payments as exported.
**Body:** 0
**Scope:** `tn.acc.appayments:w`

### GET /tenant/{tenant}/bank-deposits
Gets a paginated list of deposits
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `depositDateBefore`, `depositDateOnOrAfter`, `reviewedBefore`, `reviewedOnOrAfter`, `reviewStatus` — Values: [NeedsReview, Reviewed], `depositStatus` — Values: [Undefined, Open, Deposited], `syncStatus` — Values: [Pending, Posted, Exported], `grossAmountGreater`, `grossAmountLess`, `sort` — Applies sorting by the specified field:\
**Scope:** `tn.acc.bankdeposits:r`

### POST /tenant/{tenant}/bank-deposits/markasexported
Marks deposits as exported
**Body:** ids
**Scope:** `tn.acc.bankdeposits:w`

### GET /tenant/{tenant}/bank-deposits/{id}/transactions
Gets a paginated list of transactions
**Scope:** `tn.acc.bankdeposits:r`

### GET /tenant/{tenant}/credit-memos
CreditMemos_GetCreditMemosList
**Params:** `active` — Values: [True, Any, False], `ids`, `businessUnitIds`, `appliedToInvoiceIds`, `appliedToReferenceNumber`, `dateBefore`, `dateOnOrAfter`, `appliedBefore`, `appliedOnOrAfter`, `modifiedBefore`, `modifiedOnOrAfter`, `createdBefore`, `createdOnOrAfter`, `batchId`, `batchNumber`, `customField.Fields` — Dictionary of name-value pairs, `customField.Operator` — Operator to be used between the name-value pairs. Can be "Or" or "And", default , `totalFilter.Amount`, `totalFilter.Comparer` — Values: [Equal, NotEqual, GreaterThan, GreaterThanOrEqual, LessThan, LessThanOrE, `balanceFilter.Amount`, `balanceFilter.Comparer` — Values: [Equal, NotEqual, GreaterThan, GreaterThanOrEqual, LessThan, LessThanOrE, `sort`
**Scope:** `tn.acc.creditmemos:r`

### GET /tenant/{tenant}/credit-memos/credit-memo-items
CreditMemos_GetCreditMemosItemsList
**Params:** `creditMemoIds`, `active` — Values: [True, Any, False], `businessUnitIds`, `createdBefore`, `createdOnOrAfter`, `sort`
**Scope:** `tn.acc.creditmemos:r`

### ⭐ GET /tenant/{tenant}/credit-memos/custom-fields
Returns a paginated list of filtered custom field types available for credit memos
**Params:** `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort`
**Scope:** `tn.acc.creditmemos:r`

### ⭐ PATCH /tenant/{tenant}/credit-memos/custom-fields
Update custom fields for specified credit memos
**Body:** operations
**Scope:** `tn.acc.creditmemos:w`

### POST /tenant/{tenant}/credit-memos/markasexported
mark credit memo as exported. Id = creditMemoId
**Body:** 0
**Scope:** `tn.acc.creditmemos:w`

### PATCH /tenant/{tenant}/credit-memos/{id}
CreditMemos_UpdateCreditMemo
**Body:** active, summary, date, businessUnitId
**Scope:** `tn.acc.creditmemos:w`

### GET /tenant/{tenant}/credit-memos/{id}/items
CreditMemos_GetCreditMemoItemsList
**Params:** `active` — Values: [True, Any, False], `businessUnitIds`, `createdBefore`, `createdOnOrAfter`, `sort`
**Scope:** `tn.acc.creditmemos:r`

### POST /tenant/{tenant}/credit-memos/{id}/splits
CreditMemos_AddCreditMemoSplits
**Body:** splits
**Scope:** `tn.acc.creditmemos:w`

### GET /tenant/{tenant}/export/inventory-bills
Provides export feed for inventory bills
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.acc.inventorybills:r`

### ⭐ GET /tenant/{tenant}/export/invoice-items
Provides export feed for invoice items
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.acc.invoiceitems:r`

### ⭐ GET /tenant/{tenant}/export/invoices
Provides export feed for invoices
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.acc.invoices:r`

### GET /tenant/{tenant}/export/payments
Provides export feed for payments
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.acc.payments:r`

### GET /tenant/{tenant}/gl-accounts
Retrieves General Ledger accounts that match the given criteria
**Params:** `ids` — Comma-delimited list of account IDs, maximum 50 items, `names` — Comma-delimited list of account names, maximum 50 items, `numbers` — Comma-delimited list of account numbers, maximum 50 items, `types` — Comma-delimited list of account types, maximum 50 items, `subtypes` — Comma-delimited list of account subtypes, maximum 50 items, `description` — A substring that must be contained in the account description, `source` — Account source\, `active` — Specify if only active accounts, only inactive accounts, or both, should be retr, `isIntacctGroup` — Set to true to retrieve Intacct group accounts only, `isIntacctBankAccount` — Set to true to retrieve Intacct bank accounts only, `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `sort` — Applies sorting by specified fields
**Scope:** `tn.acc.glaccounts:r`

### POST /tenant/{tenant}/gl-accounts
Creates a new General Ledger account
**Body:** name, number, description, type, subtype
**Scope:** `tn.acc.glaccounts:w`

### GET /tenant/{tenant}/gl-accounts/types
Retrieves General Ledger account types that match the given criteria
**Params:** `ids` — Comma-delimited list of account type IDs, maximum 50 items, `names` — Comma-delimited list of account type names, maximum 50 items, `active` — What kind of items should be returned (only active items will be returned by def, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by specified fields
**Scope:** `tn.acc.glaccounts:r`

### GET /tenant/{tenant}/gl-accounts/{accountId}
Retrieves single General Ledger account by account id
**Scope:** `tn.acc.glaccounts:r`

### PATCH /tenant/{tenant}/gl-accounts/{accountId}
Updates General Ledger account
**Body:** name, number, description, type, subtype, active
**Scope:** `tn.acc.glaccounts:w`

### GET /tenant/{tenant}/inventory-bills
InventoryBills_GetList
**Params:** `ids`, `batchId`, `batchNumber`, `billNumber`, `businessUnitIds`, `customField.Fields` — Dictionary of name-value pairs, `customField.Operator` — Operator to be used between the name-value pairs. Can be "Or" or "And", default , `dateFrom`, `dateTo`, `jobNumber`, `purchaseOrderNumber`, `purchaseOrderTypes`, `syncStatuses`, `minCost`, `maxCost`, `billType` — Values: [NotSet, Procurement, ApBill, RecurringBill], `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `dateReconciledBefore`, `dateReconciledOnOrAfter`, `threeWayMatchDiscrepancy` — Values: [NoDiscrepancy, Discrepancy]
**Scope:** `tn.acc.inventorybills:r`

### ⭐ GET /tenant/{tenant}/inventory-bills/custom-fields
Returns a paginated list of filtered custom field types available for inventory bills
**Params:** `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort`
**Scope:** `tn.acc.inventorybills:r`

### ⭐ PATCH /tenant/{tenant}/inventory-bills/custom-fields
InventoryBills_UpdateCustomFields
**Body:** operations
**Scope:** `tn.acc.inventorybills:w`

### POST /tenant/{tenant}/inventory-bills/markasexported
mark bill as exported. Id = inventoryBillId
**Body:** inventoryBillIds
**Scope:** `tn.acc.inventorybills:w`

### GET /tenant/{tenant}/inventory-bills/paginated
InventoryBills_GetListPaginated
**Params:** `ids`, `batchId`, `batchNumber`, `billNumber`, `businessUnitIds`, `customField.Fields` — Dictionary of name-value pairs, `customField.Operator` — Operator to be used between the name-value pairs. Can be "Or" or "And", default , `dateFrom`, `dateTo`, `jobNumber`, `purchaseOrderNumber`, `purchaseOrderTypes`, `syncStatuses`, `minCost`, `maxCost`, `billType` — Values: [NotSet, Procurement, ApBill, RecurringBill], `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `dateReconciledBefore`, `dateReconciledOnOrAfter`, `threeWayMatchDiscrepancy` — Values: [NoDiscrepancy, Discrepancy]
**Scope:** `tn.acc.inventorybills:r`

### ⭐ GET /tenant/{tenant}/invoices
Retrieves a list of invoices.  By default, all invoices will be returned regardless of status.
**Params:** `ids` — Comma-delimited list of invoice IDs., `activeState` — Values: [ActiveOnly, InactiveOnly, All], `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `statuses` — Transaction status, which can be one of: Pending, Posted, Exported., `batchId` — Batch ID associated with invoices., `batchNumber` — Batch number associated with invoices., `customField.Fields` — Dictionary of name-value pairs, `customField.Operator` — Operator to be used between the name-value pairs. Can be "Or" or "And", default , `jobId` — Job ID associated with invoices. This will be null if the invoice is not linked , `jobNumber` — Job number associated with invoices. This will be null if the invoice is not lin, `businessUnitId` — Business unit ID associated with invoices., `customerId` — Customer ID associated with invoices., `invoicedOnOrAfter`, `invoicedOnBefore`, `adjustmentToId` — When searching for adjustment invoices, this field will search for invoices that, `number` — Reference number associated with invoices., `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `createdBefore` — Return items created before certain date/time (in UTC), `totalGreater` — Retrieve all invoices with a total greater than or equal to the input value., `totalLess` — Retrieve all invoices with a total less than or equal to the input value., `balanceFilter.Balance`, `balanceFilter.Comparer` — Values: [Equals, NotEquals, Greater, Less], `dueDateBefore` — Retrieve all invoices with a due date before the input value, `dueDateOnOrAfter` — Retrieve all invoices with a due date on after or equal the input value, `orderBy` — Field on which you want to order the returned list of invoices., `orderByDirection` — Order direction of the retuned list of invoices.  Values of "desc" or "descendin, `reviewStatuses` — Review statuses associated with invoices., `assignedToIds` — AssignedTo IDs associated with invoices., `invoiceConfigurations` — Invoice configuration associated with invoices., `sort` — Applies sorting by the specified field:\
**Scope:** `tn.acc.invoices:r`

### ⭐ POST /tenant/{tenant}/invoices
create adjustment invoice
**Body:** number, typeId, invoicedOn, subtotal, tax, taxZoneId, summary, royaltyStatus
**Scope:** `tn.acc.invoices:w`

### ⭐ PATCH /tenant/{tenant}/invoices/custom-fields
Updates custom fields for specified invoices
**Body:** operations
**Scope:** `tn.acc.invoices:w`

### ⭐ GET /tenant/{tenant}/invoices/custom-fields
Returns a paginated list of filtered custom field types available for invoices
**Params:** `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort`
**Scope:** `tn.acc.invoices:r`

### ⭐ POST /tenant/{tenant}/invoices/markasexported
mark invoice as exported. Id = invoiceId
**Body:** 0
**Scope:** `tn.acc.invoices:w`

### ⭐ PATCH /tenant/{tenant}/invoices/{id}
update invoice
**Body:** number, typeId, invoicedOn, subtotal, tax, taxZoneId, summary, royaltyStatus
**Scope:** `tn.acc.invoices:w`

### ⭐ PATCH /tenant/{tenant}/invoices/{invoiceId}/items
update invoice items
**Body:** skuId, skuName, technicianId, description, quantity, unitPrice, cost, isAddOn
**Scope:** `tn.acc.invoices:w`

### ⭐ DELETE /tenant/{tenant}/invoices/{invoiceId}/items/{itemId}
delete invoice item
**Scope:** `tn.acc.invoices:w`

### ⭐ GET /tenant/{tenant}/invoices/{invoiceId}/tasks
Invoices_GetInvoiceTasks
**Scope:** `tn.acc.invoices:r`

### ⭐ POST /tenant/{tenant}/invoices/{invoiceId}/tasks
Creates an invoice task from a template
**Body:** templateId, variables
**Scope:** `tn.acc.invoices:w`

### ⭐ PATCH /tenant/{tenant}/invoices/{invoiceId}/tasks/{taskId}
Updates an invoice task
**Body:** name, status, assigneeId, dueDate, description
**Scope:** `tn.acc.invoices:w`

### GET /tenant/{tenant}/journal-entries
Gets a list of journal entries.
**Params:** `ids` — Comma-delimited list of journal entry IDs, maximum 50 items, `exportedFrom` — Exported on or after certain date/time (in UTC), `exportedTo` — Exported on or before certain date/time (in UTC), `postedFrom` — Posted on or after certain date (time is ignored), `postedTo` — Posted on or before certain date (time is ignored), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `exportedBy` — Comma-delimited list of user IDs, maximum 50 items, `name` — Name contains, `numberFrom` — Number is greater or equal than, `numberTo` — Number is less or equal to, `statuses` — Array of statuses, `syncStatuses` — Array of sync statuses, `transactionPostedFrom` — Contains a transaction posted on or after certain date (time is ignored), `transactionPostedTo` — Contains a transaction posted on or before certain date (time is ignored), `businessUnitIds` — Comma-delimited list of business unit IDs, maximum 50 items, `serviceAgreementIds` — Comma-delimited list of service agreement IDs, maximum 50 items, `customerName` — Contains a transaction for a customer with name containing, `locationName` — Contains a transaction for a customer location with name containing, `vendorName` — Contains a transaction for a vendor with name containing, `inventoryLocationName` — Contains a transaction for an inventory location with name containing, `refNumber` — Comma-delimited list of reference numbers, maximum 50 items, `transactionTypes` — List of transaction types.\, `customField` — Filter by custom fields associated with journal entries.\, `empty` — Indicates whether empty journal entries should be included in journal entry quer, `sort` — Applies sorting by the specified field and direction.\
**Scope:** `tn.acc.journalentries:r`

### POST /tenant/{tenant}/journal-entries
Creates a new journal entry record, automatically marks it as external.
**Body:** name, status, versionId, message, postDate, customFields, lines
**Scope:** `tn.acc.journalentries:w`

### GET /tenant/{tenant}/journal-entries/{id}
Gets a journal entry by ID
**Scope:** `tn.acc.journalentries:r`

### PUT /tenant/{tenant}/journal-entries/{id}
Updates journal entry, supports only for external journal entry records.
To add a line, supply all the original lines along with the new one. To delete a line, supply only the lines you want to keep.
**Body:** name, status, versionId, message, postDate, customFields, lines
**Scope:** `tn.acc.journalentries:w`

### DELETE /tenant/{tenant}/journal-entries/{id}
Deletes journal entry, supports only for external journal entry records.
**Scope:** `tn.acc.journalentries:w`

### PATCH /tenant/{tenant}/journal-entries/{id}
Updates a journal entry.
**Body:** status, customFields
**Scope:** `tn.acc.journalentries:w`

### GET /tenant/{tenant}/journal-entries/{id}/details
Gets a list of journal entry items aggregated by account, business unit, transaction and pricebook item.
**Scope:** `tn.acc.journalentries:r`

### GET /tenant/{tenant}/journal-entries/{id}/summary
Gets a list of journal entry items aggregated by account and business unit.
**Scope:** `tn.acc.journalentries:r`

### PATCH /tenant/{tenant}/journal-entries/{id}/sync
Updates a journal entry sync state.
**Body:** syncStatus, versionId, message, customFields
**Scope:** `tn.acc.journalentries:w`

### GET /tenant/{tenant}/payment-terms
Gets a list of payment terms
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore`, `modifiedOnOrAfter`, `sort` — Applies sorting by the specified field:\
**Scope:** `tn.acc.paymentterms:r`

### GET /tenant/{tenant}/payment-terms/{paymentTermId}
Gets Payment Term
**Scope:** `tn.acc.paymentterms:r`

### GET /tenant/{tenant}/payment-types
Gets a list of payment types
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `active` — What kind of items should be returned (only active items will be returned by def, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC)
**Scope:** `tn.acc.paymenttypes:r`

### GET /tenant/{tenant}/payment-types/{id}
Gets payment type specified by ID
**Scope:** `tn.acc.paymenttypes:r`

### GET /tenant/{tenant}/payments
Gets a paginated list of payments
**Params:** `activeState` — Default: null (ActiveOnly), `appliedToInvoiceIds`, `appliedToReferenceNumber`, `batchId`, `batchNumber`, `businessUnitIds`, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `customerId`, `customField.Fields` — Dictionary of name-value pairs, `customField.Operator` — Operator to be used between the name-value pairs. Can be "Or" or "And", default , `depositIds`, `ids` — Perform lookup by multiple IDs (maximum 50), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `paidOnAfter`, `paidOnBefore`, `sort` — Applies sorting by the specified field:\, `statuses`, `totalGreater`, `totalLess`, `transactionType` — Values: [Undefined, JournalEntry, ReceivePayment]
**Scope:** `tn.acc.payments:r`

### ⭐ GET /tenant/{tenant}/payments/custom-fields
Returns a paginated list of filtered custom field types available for payments
**Params:** `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort`
**Scope:** `tn.acc.payments:r`

### ⭐ PATCH /tenant/{tenant}/payments/custom-fields
Update custom fields for specified payments
**Body:** operations
**Scope:** `tn.acc.payments:w`

### POST /tenant/{tenant}/payments/status
Updates payment status
**Body:** paymentIds, status
**Scope:** `tn.acc.payments:w`

### PATCH /tenant/{tenant}/payments/{id}
Updates specified payment in "patch" mode
**Body:** active, authCode, checkNumber, exportId, memo, paidOn, splits, status
**Scope:** `tn.acc.payments:w`

### GET /tenant/{tenant}/remittance-vendors
Returns a paginated list of Remittance Vendors with detailed item information, filtering capabilities, and associated metadata
**Params:** `ids` — Ids to filter by, `active` — What kind of items should be returned (only active items will be returned by def, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by the specified field:\
**Scope:** `tn.acc.remittancevendors:r`

### GET /tenant/{tenant}/remittance-vendors/{id}
Returns a single Remittance Vendor by its unique identifier with complete details including items, expense items, and associated metadata
**Scope:** `tn.acc.remittancevendors:r`

### GET /tenant/{tenant}/tax-zones
Get a list of tax zones and their rates.
**Params:** `ids` — Tax Zone Ids to pull tax zones for, `active` — What kind of items should be returned (only active items will be returned by def, `createdBefore`, `createdOnOrAfter`, `modifiedBefore`, `modifiedOnOrAfter`, `sort` — Applies sorting by the specified field:\
**Scope:** `tn.acc.taxzones:r`

---

## CRM
**Base:** `https://api.servicetitan.io/crm/v2`
**File:** `tenant-crm-v2.json`

### POST /tenant/{tenant}/booking-provider-tags
Create a booking provider tag
**Body:** tagName, description
**Scope:** `tn.crm.bookingprovidertags:w`

### GET /tenant/{tenant}/booking-provider-tags
Gets a list of booking provider tags
**Params:** `name` — Name of the booking provider tag, `ids` — Perform lookup by multiple IDs (maximum 50), `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by the specified field:\
**Scope:** `tn.crm.bookingprovidertags:r`

### GET /tenant/{tenant}/booking-provider-tags/{id}
Gets a single booking provider tag by ID
**Scope:** `tn.crm.bookingprovidertags:r`

### PATCH /tenant/{tenant}/booking-provider-tags/{id}
Update a booking provider tag
**Body:** tagName, description
**Scope:** `tn.crm.bookingprovidertags:w`

### GET /tenant/{tenant}/booking-provider/{booking_provider}/bookings
Gets a list of bookings for a booking provider
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `externalId` — Filters by booking's external ID, `sort` — Applies sorting by the specified field:\
**Scope:** `tn.crm.bookings:r`

### POST /tenant/{tenant}/booking-provider/{booking_provider}/bookings
Creates a booking for a booking provider
**Body:** source, name, address, contacts, customerType, start, summary, campaignId
**Scope:** `tn.crm.bookings:w`

### GET /tenant/{tenant}/booking-provider/{booking_provider}/bookings/{id}
Gets a booking by ID for a booking provider
**Scope:** `tn.crm.bookings:r`

### PATCH /tenant/{tenant}/booking-provider/{booking_provider}/bookings/{id}
Updates a booking for a booking provider
**Body:** source, name, address, customerType, start, summary, campaignId, businessUnitId
**Scope:** `tn.crm.bookings:w`

### POST /tenant/{tenant}/booking-provider/{booking_provider}/bookings/{id}/contacts
Creates a contact on the specified booking for a booking provider
**Body:** type, value, memo
**Scope:** `tn.crm.bookings:w`

### GET /tenant/{tenant}/booking-provider/{booking_provider}/bookings/{id}/contacts
Get a list of contacts for a booking for a booking provider
**Scope:** `tn.crm.bookings:r`

### PATCH /tenant/{tenant}/booking-provider/{booking_provider}/bookings/{id}/contacts/{contactId}
Updates a single booking contact for a booking provider
**Body:** type, value, memo
**Scope:** `tn.crm.bookings:w`

### DELETE /tenant/{tenant}/booking-provider/{booking_provider}/bookings/{id}/contacts/{contactId}
Removes a contact from a booking for a booking provider
**Scope:** `tn.crm.bookings:w`

### POST /tenant/{tenant}/booking-provider/{booking_provider}/bookings/{id}/dismiss
Bookings_DismissBooking
**Body:** callReasonId, dismissingMemo
**Scope:** `tn.crm.bookings:w`

### GET /tenant/{tenant}/bookings
Gets a list of bookings
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `externalId` — Filters by booking's external ID, `sort` — Applies sorting by the specified field:\
**Scope:** `tn.crm.bookings:r`

### GET /tenant/{tenant}/bookings/{id}
Gets a booking by ID
**Scope:** `tn.crm.bookings:r`

### GET /tenant/{tenant}/bookings/{id}/contacts
Get a list of contacts for a booking
**Scope:** `tn.crm.bookings:r`

### GET /tenant/{tenant}/contacts
Gets a list of contacts
**Params:** `name` — Filters by contact name, `title` — Filters by contact title, `referenceId` — Filters by external reference ID, `isArchived` — Filters by contact archive status, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by the specified field:\
**Scope:** `tn.crm.contacts:r`

### POST /tenant/{tenant}/contacts
Creates a new contact
**Body:** name, title, referenceId
**Scope:** `tn.crm.contacts:w`

### GET /tenant/{tenant}/contacts/contact-methods
Search for contact methods
**Params:** `contactId`, `referenceId` — Filters by reference ID, `type` — Filters by contact method type, `value` — Filters by contact method value, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by the specified field:\
**Scope:** `tn.crm.contacts:r`

### GET /tenant/{tenant}/contacts/preferences
Gets a list of preferences metadata
**Scope:** `tn.crm.contacts:r`

### GET /tenant/{tenant}/contacts/relationships/{relationshipId}
Gets a list of contacts for a specified relationship ID
**Params:** `name` — Filters by contact name, `title` — Filters by contact title, `referenceId` — Filters by external reference ID, `isArchived` — Filters by contact archive status, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by the specified field:\
**Scope:** `tn.crm.contacts:r`

### GET /tenant/{tenant}/contacts/{contactId}/contact-methods
Gets a list of contact methods for a specified contact ID
**Params:** `referenceId` — Filters by reference ID, `type` — Filters by contact method type, `value` — Filters by contact method value, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by the specified field:\
**Scope:** `tn.crm.contacts:r`

### POST /tenant/{tenant}/contacts/{contactId}/contact-methods
Creates a new contact method
**Body:** referenceId, type, value, memo
**Scope:** `tn.crm.contacts:w`

### GET /tenant/{tenant}/contacts/{contactId}/contact-methods/{contactMethodId}
Gets a contact method specified by ID
**Scope:** `tn.crm.contacts:r`

### PUT /tenant/{tenant}/contacts/{contactId}/contact-methods/{contactMethodId}
Replaces a contact method
**Body:** referenceId, type, value, memo
**Scope:** `tn.crm.contacts:w`

### PATCH /tenant/{tenant}/contacts/{contactId}/contact-methods/{contactMethodId}
Updates a contact method
**Body:** value, memo
**Scope:** `tn.crm.contacts:w`

### DELETE /tenant/{tenant}/contacts/{contactId}/contact-methods/{contactMethodId}
Deletes a contact method
**Scope:** `tn.crm.contacts:w`

### GET /tenant/{tenant}/contacts/{contactId}/contact-methods/{contactMethodId}/preferences
Gets a list of contact preferences for a specified contact method ID
**Scope:** `tn.crm.contacts:r`

### GET /tenant/{tenant}/contacts/{contactId}/contact-methods/{contactMethodId}/preferences/{preferenceName}
Gets a contact preference specified by preference name
**Scope:** `tn.crm.contacts:r`

### PATCH /tenant/{tenant}/contacts/{contactId}/contact-methods/{contactMethodId}/preferences/{preferenceName}
Updates a contact preference
**Body:** value
**Scope:** `tn.crm.contacts:w`

### GET /tenant/{tenant}/contacts/{contactId}/relationships
Gets a list of contact relationships
**Params:** `relatedEntityId` — Filters by related entity id, `typeSlug` — Relationship type slug: customer, location, booking, `typeName` — Relationship type name: Customer, Location, Booking, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `sort` — Applies sorting by the specified field:\
**Scope:** `tn.crm.contacts:r`

### DELETE /tenant/{tenant}/contacts/{contactId}/relationships/{relatedEntityId}/{typeSlug}
Removes a relationship from a contact
**Scope:** `tn.crm.contacts:w`

### POST /tenant/{tenant}/contacts/{contactId}/relationships/{relatedEntityId}/{typeSlug}
Create a contact relationship
**Scope:** `tn.crm.contacts:w`

### GET /tenant/{tenant}/contacts/{id}
Gets a contact specified by ID
**Scope:** `tn.crm.contacts:r`

### PUT /tenant/{tenant}/contacts/{id}
Replaces a contact
**Body:** name, title, referenceId, isArchived
**Scope:** `tn.crm.contacts:w`

### DELETE /tenant/{tenant}/contacts/{id}
Deletes a contact
**Scope:** `tn.crm.contacts:w`

### PATCH /tenant/{tenant}/contacts/{id}
Updates a contact
**Body:** name, title, referenceId, isArchived
**Scope:** `tn.crm.contacts:w`

### ⭐ GET /tenant/{tenant}/customers
Gets a list of Customers
**Params:** `sort` — Applies sorting by the specified field:\, `ids` — Returns specific customer records by customer ID., `createdBefore` — Returns customer records created before the requested date (in UTC), `createdOnOrAfter` — Returns customer records created on or after the requested date (in UTC), `modifiedBefore` — Returns customer records modified before the requested date (in UTC), `modifiedOnOrAfter` — Returns customer records modified after the requested date (in UTC), `excludeAccountingChangesFromModifiedDateRange` — Excludes accounting changes such as balance adjustments from the modified date r, `name` — Returns customer records by name., `street` — Returns customer records by street., `unit` — Returns customer records by unit., `city` — Returns customer records by city., `state` — Returns customer records by state., `zip` — Returns customer records by zip., `country` — Returns customer records by country., `latitude` — Returns customer records by latitude., `longitude` — Returns customer records by longitude., `phone` — Returns customer records by phone number of contacts., `active` — Returns customer records by active status (only active items will be returned by, `externalDataApplicationGuid` — Returns customer records with external data for a particular GUID, `externalDataKey`, `externalDataValues`
**Scope:** `tn.crm.customers:r`

### ⭐ POST /tenant/{tenant}/customers
Creates a New Customer
**Body:** name, type, doNotMail, doNotService, nationalAccount, locations, address, contacts
**Scope:** `tn.crm.customers:w`

### ⭐ GET /tenant/{tenant}/customers/contacts
Gets a list of contacts for a specific modified-on date range or by their Customer IDs. Either CustomerIds, modifiedOn or modifiedOnOrAfter parameter must be specified
**Params:** `modifiedBefore` — Return items modified before certain date/time (in UTC). Either modifiedBefore o, `modifiedOnOrAfter` — Return items modified on/after certain date/time (in UTC). Either modifiedBefore, `customerIds` — Returns specific contact records by customer IDs., `createdBefore` — Returns items created before the requested date (in UTC), `createdOnOrAfter` — Returns items created on or after the requested date (in UTC)
**Scope:** `tn.crm.customers:r`

### ⭐ GET /tenant/{tenant}/customers/custom-fields
Gets a list of custom field types available for customers
**Params:** `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort`
**Scope:** `tn.crm.customers:r`

### ⭐ GET /tenant/{tenant}/customers/{id}
Gets a Customer specified by ID
**Scope:** `tn.crm.customers:r`

### ⭐ PATCH /tenant/{tenant}/customers/{id}
Update a customer
**Body:** name, type, address, customFields, externalData, doNotMail, doNotService, nationalAccount
**Scope:** `tn.crm.customers:w`

### ⭐ GET /tenant/{tenant}/customers/{id}/contacts
Gets a list of contacts for the specified customer
**Scope:** `tn.crm.customers:r`

### ⭐ POST /tenant/{tenant}/customers/{id}/contacts
Creates a contact on the customer
**Body:** type, value, memo
**Scope:** `tn.crm.customers:w`

### ⭐ DELETE /tenant/{tenant}/customers/{id}/contacts/{contactId}
Removes a contact from a customer
**Scope:** `tn.crm.customers:w`

### ⭐ PATCH /tenant/{tenant}/customers/{id}/contacts/{contactId}
Updates a contact on the customer
**Body:** type, value, memo, preferences
**Scope:** `tn.crm.customers:w`

### ⭐ GET /tenant/{tenant}/customers/{id}/notes
Gets a list of notes for a customer
**Params:** `createdBefore` — Returns notes created before the requested date (in UTC), `createdOnOrAfter` — Returns notes created on or after the requested date (in UTC), `modifiedBefore` — Returns notes modified before the requested date (in UTC), `modifiedOnOrAfter` — Returns notes modified after the requested date (in UTC)
**Scope:** `tn.crm.customers:r`

### ⭐ POST /tenant/{tenant}/customers/{id}/notes
Creates a New Note
**Body:** text, pinToTop, addToLocations
**Scope:** `tn.crm.customers:w`

### ⭐ DELETE /tenant/{tenant}/customers/{id}/notes/{noteId}
Deletes a note on the specified customer
**Scope:** `tn.crm.customers:w`

### ⭐ POST /tenant/{tenant}/customers/{id}/tags/{tagTypeId}
Adds a Tag to a Customer
**Scope:** `tn.crm.customers:w`

### ⭐ DELETE /tenant/{tenant}/customers/{id}/tags/{tagTypeId}
Removes a Tag from a Customer
**Scope:** `tn.crm.customers:w`

### GET /tenant/{tenant}/export/bookings
Provides export feed for bookings
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.crm.bookings:r`

### ⭐ GET /tenant/{tenant}/export/customers
Provides export feed for customers
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.crm.customers:r`

### ⭐ GET /tenant/{tenant}/export/customers/contacts
Provides export feed for customer contacts
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.crm.customers:r`

### GET /tenant/{tenant}/export/leads
Provides export feed for leads
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.crm.leads:r`

### GET /tenant/{tenant}/export/locations
Provides export feed for appointments
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.crm.locations:r`

### GET /tenant/{tenant}/export/locations/contacts
Provides export feed for locations contacts
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.crm.locations:r`

### GET /tenant/{tenant}/leads
Gets a list of leads
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `customerId` — Filters by associated customer, `isProspect` — Allows to filter leads where the customer doesn't have a job, or there is no cus, `withoutCustomer` — Allows to filter leads that don't have a customer or location record associated , `status` — Filters by status\, `customerCity` — Filters by customer city, `customerState` — Filters by customer state, `customerZip` — Filters by customer zip, `customerCreatedOnOrAfter` — Returns customers who were created on or before a certain date/time (in UTC), `customerCreatedBefore` — Returns customers who were created after a certain date/time (in UTC), `customerModifiedOnOrAfter` — Returns customers who were modified on or before a certain date/time (in UTC), `sort` — Applies sorting by the specified field:\, `genPermUrl` — If true, generates a permanent URL for the lead, `leadCustomerName` — Filters by customer name, `leadPhone` — Filters by phone, `isCaptureSourceForm` — Filters by capture source
**Scope:** `tn.crm.leads:r`

### POST /tenant/{tenant}/leads
Creates a lead
**Body:** customerId, locationId, campaignId, businessUnitId, jobTypeId, summary, tagTypeIds, priority
**Scope:** `tn.crm.leads:w`

### POST /tenant/{tenant}/leads/form
Submits a lead form
**Params:** `id`
**Body:** name, email, phoneNumber, address, summary
**Scope:** `tn.crm.leads:w`

### GET /tenant/{tenant}/leads/{id}
Gets a lead specified by ID
**Scope:** `tn.crm.leads:r`

### PATCH /tenant/{tenant}/leads/{id}
Updates a lead
**Body:** campaignId, priority, businessUnitId, jobTypeId, summary, leadCustomerName, leadPhone, leadEmail
**Scope:** `tn.crm.leads:w`

### POST /tenant/{tenant}/leads/{id}/dismiss
Dismisses a lead specified by ID
**Body:** dismissingReasonId
**Scope:** `tn.crm.leads:w`

### POST /tenant/{tenant}/leads/{id}/follow-up
Creates a follow-up
**Body:** followUpDate, text, pinToTop
**Scope:** `tn.crm.leads:w`

### GET /tenant/{tenant}/leads/{id}/notes
Gets notes for a lead
**Params:** `createdBefore` — Returns notes created before the requested date (in UTC), `createdOnOrAfter` — Returns notes created on or after the requested date (in UTC), `modifiedBefore` — Returns notes modified before the requested date (in UTC), `modifiedOnOrAfter` — Returns notes modified after the requested date (in UTC)
**Scope:** `tn.crm.leads:r`

### POST /tenant/{tenant}/leads/{id}/notes
Creates a note on the specified lead
**Body:** text, pinToTop
**Scope:** `tn.crm.leads:w`

### POST /tenant/{tenant}/locations
Creates a new location
**Body:** name, address, contacts, customFields, tagTypeIds, externalData, coordinatesSource, coordinatesVerificationStatus
**Scope:** `tn.crm.locations:w`

### GET /tenant/{tenant}/locations
Gets a list of locations
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `name` — Filters by customer's name, `customerId` — Filters by customer ID, `street` — Filters by customer's street, `unit` — Filters by customer's unit, `city` — Filters by customer's city, `state` — Filters by customer's state, `zip` — Filters by customer's zip, `country` — Filters by customer's country, `latitude` — Filters by customer's latitude, `longitude` — Filters by customer's longitude, `active` — What kind of items should be returned (only active items will be returned by def, `sort` — Applies sorting by the specified field:\, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `externalDataApplicationGuid` — Returns location records with external data for a particular GUID, `externalDataKey` — Performs lookup by external data key, 'externalDataValues' must also be provided, `externalDataValues` — Performs lookup by external data values (maximum 50), 'externalDataKey' must als
**Scope:** `tn.crm.locations:r`

### GET /tenant/{tenant}/locations/contacts
Gets a list of contacts for a specific ModifiedOn date range, CreatedOn date range or by their Location IDs. Either LocationIds, modifiedOn, modifiedOnOrAfter, createdBefore or createdOnOrAfter parameter must be specified.
**Params:** `modifiedBefore` — Return items modified before certain date/time (in UTC). Either modifiedBefore o, `modifiedOnOrAfter` — Return items modified on/after certain date/time (in UTC). Either modifiedBefore, `locationIds` — Returns specific contact records by location IDs., `createdBefore` — Returns items created before the requested date (in UTC), `createdOnOrAfter` — Returns items created on or after the requested date (in UTC)
**Scope:** `tn.crm.locations:r`

### ⭐ GET /tenant/{tenant}/locations/custom-fields
Gets a list of custom field types available for locations
**Params:** `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort`
**Scope:** `tn.crm.locations:r`

### GET /tenant/{tenant}/locations/{id}
Gets a location specified by ID
**Scope:** `tn.crm.locations:r`

### PATCH /tenant/{tenant}/locations/{id}
Updates a location
**Body:** customerId, name, address, active, taxZoneId, customFields, tagTypeIds, externalData
**Scope:** `tn.crm.locations:w`

### GET /tenant/{tenant}/locations/{id}/contacts
Gets a list of contacts for the specified location
**Scope:** `tn.crm.locations:r`

### POST /tenant/{tenant}/locations/{id}/contacts
Creates a contact on the location
**Body:** type, value, memo
**Scope:** `tn.crm.locations:w`

### DELETE /tenant/{tenant}/locations/{id}/contacts/{contactId}
Removes a contact from a location
**Scope:** `tn.crm.locations:w`

### PATCH /tenant/{tenant}/locations/{id}/contacts/{contactId}
Updates a contact on the location
**Body:** type, value, memo, preferences
**Scope:** `tn.crm.locations:w`

### GET /tenant/{tenant}/locations/{id}/notes
Gets a list of notes on the specified location
**Params:** `createdBefore` — Returns notes created before the requested date (in UTC), `createdOnOrAfter` — Returns notes created on or after the requested date (in UTC), `modifiedBefore` — Returns notes modified before the requested date (in UTC), `modifiedOnOrAfter` — Returns notes modified after the requested date (in UTC)
**Scope:** `tn.crm.locations:r`

### POST /tenant/{tenant}/locations/{id}/notes
Creates a note on the specified location
**Body:** text, pinToTop, addToCustomer
**Scope:** `tn.crm.locations:w`

### DELETE /tenant/{tenant}/locations/{id}/notes/{noteId}
Deletes a note on the specified location
**Scope:** `tn.crm.locations:w`

### GET /tenant/{tenant}/locations/{id}/preferredtechnician
Locations_GetPreferredTechnician
**Scope:** `tn.crm.locations:r`

### POST /tenant/{tenant}/locations/{id}/preferredtechnician/{preferredTechnicianId}
Locations_UpdatePreferredTechnician
**Scope:** `tn.crm.locations:w`

### POST /tenant/{tenant}/locations/{id}/tags/{tagTypeId}
Adds a Tag to a Location
**Scope:** `tn.crm.locations:w`

### DELETE /tenant/{tenant}/locations/{id}/tags/{tagTypeId}
Removes a Tag from a Location
**Scope:** `tn.crm.locations:w`

### PUT /tenant/{tenant}/tags
Add multiple tags to more than 1 customer
**Body:** customerIds, tagTypeIds
**Scope:** `tn.crm.tags:w`

### DELETE /tenant/{tenant}/tags
Remove multiple tags to more than 1 customer
**Body:** customerIds, tagTypeIds
**Scope:** `tn.crm.tags:w`

---

## Customer Interactions
**Base:** `https://api.servicetitan.io/customer-interactions/v2`
**File:** `tenant-customer-interactions-v2.json`

### GET /tenant/{tenant}/export/technician-ratings
Provides export feed for technician ratings
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.csi.technicianrating:r`

### ⭐ PUT /tenant/{tenant}/technician-rating/technician/{technicianId}/job/{jobId}
Add a rating for the specified technician, tied to the specific job.
If the rating already exists for that technician/ job combination, update it with the new score.
**Body:** value
**Scope:** `tn.csi.technicianrating:w`

### GET /tenant/{tenant}/technician-ratings
Gets a list of technician ratings
**Params:** `technicianId`, `jobId`, `active` — Values: [True, Any, False], `createdBefore`, `createdOnOrAfter`, `modifiedBefore`, `modifiedOnOrAfter`, `sort`
**Scope:** `tn.csi.technicianrating:r`

### POST /tenant/{tenant}/technician-ratings
Add a rating for the specified technician, tied to the specific job.
If the rating already exists for that technician/ job combination, update it with the new score.
**Body:** technicianId, jobId, rating
**Scope:** `tn.csi.technicianrating:w`

---

## Dispatch
**Base:** `https://api.servicetitan.io/dispatch/v2`
**File:** `tenant-dispatch-v2 (1).json`

### ⭐ GET /tenant/{tenant}/appointment-assignments
Gets a list of appointment assignments
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `appointmentIds` — Return appointment assignments for one or more appointments, `jobId` — Return appointment assignments for a single job, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by the specified field:\, `active` — What kind of items should be returned (only active items will be returned by def
**Scope:** `tn.dis.appointmentassignments:r`

### ⭐ POST /tenant/{tenant}/appointment-assignments/assign-technicians
Assigns the list of technicians to the appointment
**Body:** jobAppointmentId, technicianIds
**Scope:** `tn.dis.appointmentassignments:w`

### ⭐ POST /tenant/{tenant}/appointment-assignments/unassign-technicians
Unassigns the list of technicians from the appointment
**Body:** jobAppointmentId, technicianIds
**Scope:** `tn.dis.appointmentassignments:w`

### GET /tenant/{tenant}/arrival-windows
ArrivalWindows_GetList
**Params:** `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `active` — What kind of items should be returned (only active items will be returned by def
**Scope:** `tn.dis.arrivalwindows:r`

### POST /tenant/{tenant}/arrival-windows
ArrivalWindows_Create
**Body:** start, duration, businessUnitIds
**Scope:** `tn.dis.arrivalwindows:w`

### GET /tenant/{tenant}/arrival-windows/configuration
ArrivalWindows_GetConfiguration
**Scope:** `tn.dis.arrivalwindows:r`

### POST /tenant/{tenant}/arrival-windows/configuration
ArrivalWindows_UpdatedConfiguration
**Body:** configuration
**Scope:** `tn.dis.arrivalwindows:w`

### GET /tenant/{tenant}/arrival-windows/{id}
ArrivalWindows_Get
**Scope:** `tn.dis.arrivalwindows:r`

### PUT /tenant/{tenant}/arrival-windows/{id}
ArrivalWindows_Update
**Body:** start, duration, businessUnitIds
**Scope:** `tn.dis.arrivalwindows:w`

### PUT /tenant/{tenant}/arrival-windows/{id}/activated
ArrivalWindows_Activated
**Body:** isActive
**Scope:** `tn.dis.arrivalwindows:w`

### GET /tenant/{tenant}/business-hours
Gets the business hours.
**Scope:** `tn.dis.businesshours:r`

### POST /tenant/{tenant}/business-hours
BusinessHour_Create
**Body:** weekdays, saturday, sunday
**Scope:** `tn.dis.businesshours:w`

### POST /tenant/{tenant}/capacity
Capacity_GetList
**Body:** startsOnOrAfter, endsOnOrBefore, businessUnitIds, jobTypeId, skillBasedAvailability
**Scope:** `tn.dis.capacity:w`

### ⭐ GET /tenant/{tenant}/export/appointment-assignments
Provides export feed for appointment assignments
**Params:** `active` — What kind of items should be returned (only active items will be returned by def, `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.dis.appointmentassignments:r`

### POST /tenant/{tenant}/gps-provider/{gps_provider}/gps-pings
Creates new gps ping.
**Body:** 0
**Scope:** `tn.dis.gpspings:w`

### ⭐ GET /tenant/{tenant}/non-job-appointments
Gets a list of non-job appointments
**Params:** `technicianId` — Unique id of the technician this non-job appointment applies to, `startsOnOrAfter` — When the Start of non-job appointment should be at or after, `startsOnOrBefore` — When the Start of non-job appointment should be at or before, `timesheetCodeId` — Unique Id of timesheet code must apply to, `activeOnly` — Whether the result should contains only active non-job appointments, `showOnTechnicianSchedule` — Whether the non-job appointment shows on the technicians schedule even if there , `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `createdBefore` — Return items created before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `ids` — Perform lookup by multiple IDs (maximum 50), `sort` — Applies sorting by the specified field:\
**Scope:** `tn.dis.nonjobappointments:r`

### ⭐ POST /tenant/{tenant}/non-job-appointments
Create a new non-job appointment
**Body:** technicianId, start, duration, name, timesheetCodeId, summary, clearDispatchBoard, clearTechnicianView
**Scope:** `tn.dis.nonjobappointments:w`

### ⭐ GET /tenant/{tenant}/non-job-appointments/{id}
NonJobAppointments_Get
**Scope:** `tn.dis.nonjobappointments:r`

### ⭐ PUT /tenant/{tenant}/non-job-appointments/{id}
Update an existing non-job appointment
**Body:** technicianId, start, duration, name, timesheetCodeId, summary, clearDispatchBoard, clearTechnicianView
**Scope:** `tn.dis.nonjobappointments:w`

### ⭐ DELETE /tenant/{tenant}/non-job-appointments/{id}
Delete non-job appointment
**Scope:** `tn.dis.nonjobappointments:w`

### GET /tenant/{tenant}/teams
Gets a list of teams
**Params:** `includeInactive` — Whether to include inactive teams, `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `createdBefore` — Return items created before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `sort` — Applies sorting by the specified field:\
**Scope:** `tn.dis.teams:r`

### POST /tenant/{tenant}/teams
Creates new team
**Body:** active, name
**Scope:** `tn.dis.teams:w`

### GET /tenant/{tenant}/teams/{id}
Gets a specific team
**Scope:** `tn.dis.teams:r`

### DELETE /tenant/{tenant}/teams/{id}
Delete team
**Scope:** `tn.dis.teams:w`

### GET /tenant/{tenant}/technician-shifts
Gets a list of technician shifts
**Params:** `startsOnOrAfter` — When the Start of shift should be at or after, `endsOnOrBefore` — When the End of shift should be at or before, `shiftType` — Value to match ShiftType to\, `technicianId` — Unique Id of technician shift must apply to, `titleContains` — Text that must appear in the Title, `noteContains` — Text that must appear in the Note, `active` — What kind of items should be returned (only active items will be returned by def, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by the specified field:\
**Scope:** `tn.dis.technicianshifts:r`

### POST /tenant/{tenant}/technician-shifts
Creates new Technician Shift
**Body:** technicianIds, shiftType, title, start, end, note, timesheetCodeId, repeatType
**Scope:** `tn.dis.technicianshifts:w`

### POST /tenant/{tenant}/technician-shifts/bulk-delete
Deletes the technician shifts specified by the criteria
**Body:** start, end
**Scope:** `tn.dis.technicianshifts:w`

### GET /tenant/{tenant}/technician-shifts/{id}
Gets a specific technician shift
**Scope:** `tn.dis.technicianshifts:r`

### PATCH /tenant/{tenant}/technician-shifts/{id}
Updates Technician Shift
**Body:** shiftType, title, start, end, note, timesheetCodeId
**Scope:** `tn.dis.technicianshifts:w`

### DELETE /tenant/{tenant}/technician-shifts/{id}
Deletes the specified technician shift
**Scope:** `tn.dis.technicianshifts:w`

### GET /tenant/{tenant}/technician-skills
Gets a list of technician skills
**Params:** `technicianId` — Gets or sets the unique Id of the technician the skill must apply to., `active` — What kind of items should be returned (only active items will be returned by def, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Gets or sets the sorting configuration.
**Scope:** `tn.dis.technicianskills:r`

### PATCH /tenant/{tenant}/technician-skills
Assigns or replaces skills on a technician.
Returns the updated status and complete list of all technician skills after the operation.
**Body:** technicianId, skillIds, replaceExistingSkills
**Scope:** `tn.dis.technicianskills:w`

### POST /tenant/{tenant}/technician-skills
Creates a new skill and assigns it to a technician
**Body:** technicianId, name, active
**Scope:** `tn.dis.technicianskills:w`

### GET /tenant/{tenant}/technician-skills/{id}
Gets a specific technician skill
**Scope:** `tn.dis.technicianskills:r`

### DELETE /tenant/{tenant}/technician-skills/{id}
Deletes a technician skill association
**Scope:** `tn.dis.technicianskills:w`

### GET /tenant/{tenant}/technician-tracking
TechnicianTracking_Get
**Params:** `technicianId`* — Unique Id of technician that tracking url must apply to, `appointmentId`* — Unique Id of appointment that tracking url must apply to
**Scope:** `tn.dis.techniciantracking:r`

### GET /tenant/{tenant}/zones
Gets a list of zones
**Params:** `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `createdBefore` — Return items created before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `active` — What kind of items should be returned (only active items will be returned by def, `sort` — Applies sorting by the specified field:\
**Scope:** `tn.dis.zones:r`

### POST /tenant/{tenant}/zones
Creates a new zone
**Body:** name, zips, cities, territoryNumbers, locnNumbers, serviceDaysEnabled, serviceDaysIds, businessUnits
**Scope:** `tn.dis.zones:w`

### GET /tenant/{tenant}/zones/{id}
Gets a specific zone
**Scope:** `tn.dis.zones:r`

### PATCH /tenant/{tenant}/zones/{zoneId}
Updates an existing zone
**Body:** name, zips, cities, territoryNumbers, locnNumbers, serviceDaysEnabled, serviceDaysIds, businessUnits
**Scope:** `tn.dis.zones:w`

### DELETE /tenant/{tenant}/zones/{zoneId}
Deletes a zone
**Scope:** `tn.dis.zones:w`

---

## Dispatch
**Base:** `https://api.servicetitan.io/dispatch/v2`
**File:** `tenant-dispatch-v2.json`

### ⭐ GET /tenant/{tenant}/appointment-assignments
Gets a list of appointment assignments
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `appointmentIds` — Return appointment assignments for one or more appointments, `jobId` — Return appointment assignments for a single job, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by the specified field:\, `active` — What kind of items should be returned (only active items will be returned by def
**Scope:** `tn.dis.appointmentassignments:r`

### ⭐ POST /tenant/{tenant}/appointment-assignments/assign-technicians
Assigns the list of technicians to the appointment
**Body:** jobAppointmentId, technicianIds
**Scope:** `tn.dis.appointmentassignments:w`

### ⭐ POST /tenant/{tenant}/appointment-assignments/unassign-technicians
Unassigns the list of technicians from the appointment
**Body:** jobAppointmentId, technicianIds
**Scope:** `tn.dis.appointmentassignments:w`

### GET /tenant/{tenant}/arrival-windows
ArrivalWindows_GetList
**Params:** `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `active` — What kind of items should be returned (only active items will be returned by def
**Scope:** `tn.dis.arrivalwindows:r`

### POST /tenant/{tenant}/arrival-windows
ArrivalWindows_Create
**Body:** start, duration, businessUnitIds
**Scope:** `tn.dis.arrivalwindows:w`

### GET /tenant/{tenant}/arrival-windows/configuration
ArrivalWindows_GetConfiguration
**Scope:** `tn.dis.arrivalwindows:r`

### POST /tenant/{tenant}/arrival-windows/configuration
ArrivalWindows_UpdatedConfiguration
**Body:** configuration
**Scope:** `tn.dis.arrivalwindows:w`

### GET /tenant/{tenant}/arrival-windows/{id}
ArrivalWindows_Get
**Scope:** `tn.dis.arrivalwindows:r`

### PUT /tenant/{tenant}/arrival-windows/{id}
ArrivalWindows_Update
**Body:** start, duration, businessUnitIds
**Scope:** `tn.dis.arrivalwindows:w`

### PUT /tenant/{tenant}/arrival-windows/{id}/activated
ArrivalWindows_Activated
**Body:** isActive
**Scope:** `tn.dis.arrivalwindows:w`

### GET /tenant/{tenant}/business-hours
Gets the business hours.
**Scope:** `tn.dis.businesshours:r`

### POST /tenant/{tenant}/business-hours
BusinessHour_Create
**Body:** weekdays, saturday, sunday
**Scope:** `tn.dis.businesshours:w`

### POST /tenant/{tenant}/capacity
Capacity_GetList
**Body:** startsOnOrAfter, endsOnOrBefore, businessUnitIds, jobTypeId, skillBasedAvailability
**Scope:** `tn.dis.capacity:w`

### ⭐ GET /tenant/{tenant}/export/appointment-assignments
Provides export feed for appointment assignments
**Params:** `active` — What kind of items should be returned (only active items will be returned by def, `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.dis.appointmentassignments:r`

### POST /tenant/{tenant}/gps-provider/{gps_provider}/gps-pings
Creates new gps ping.
**Body:** 0
**Scope:** `tn.dis.gpspings:w`

### ⭐ GET /tenant/{tenant}/non-job-appointments
Gets a list of non-job appointments
**Params:** `technicianId` — Unique id of the technician this non-job appointment applies to, `startsOnOrAfter` — When the Start of non-job appointment should be at or after, `startsOnOrBefore` — When the Start of non-job appointment should be at or before, `timesheetCodeId` — Unique Id of timesheet code must apply to, `activeOnly` — Whether the result should contains only active non-job appointments, `showOnTechnicianSchedule` — Whether the non-job appointment shows on the technicians schedule even if there , `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `createdBefore` — Return items created before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `ids` — Perform lookup by multiple IDs (maximum 50), `sort` — Applies sorting by the specified field:\
**Scope:** `tn.dis.nonjobappointments:r`

### ⭐ POST /tenant/{tenant}/non-job-appointments
Create a new non-job appointment
**Body:** technicianId, start, duration, name, timesheetCodeId, summary, clearDispatchBoard, clearTechnicianView
**Scope:** `tn.dis.nonjobappointments:w`

### ⭐ GET /tenant/{tenant}/non-job-appointments/{id}
NonJobAppointments_Get
**Scope:** `tn.dis.nonjobappointments:r`

### ⭐ PUT /tenant/{tenant}/non-job-appointments/{id}
Update an existing non-job appointment
**Body:** technicianId, start, duration, name, timesheetCodeId, summary, clearDispatchBoard, clearTechnicianView
**Scope:** `tn.dis.nonjobappointments:w`

### ⭐ DELETE /tenant/{tenant}/non-job-appointments/{id}
Delete non-job appointment
**Scope:** `tn.dis.nonjobappointments:w`

### GET /tenant/{tenant}/teams
Gets a list of teams
**Params:** `includeInactive` — Whether to include inactive teams, `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `createdBefore` — Return items created before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `sort` — Applies sorting by the specified field:\
**Scope:** `tn.dis.teams:r`

### POST /tenant/{tenant}/teams
Creates new team
**Body:** active, name
**Scope:** `tn.dis.teams:w`

### GET /tenant/{tenant}/teams/{id}
Gets a specific team
**Scope:** `tn.dis.teams:r`

### DELETE /tenant/{tenant}/teams/{id}
Delete team
**Scope:** `tn.dis.teams:w`

### GET /tenant/{tenant}/technician-shifts
Gets a list of technician shifts
**Params:** `startsOnOrAfter` — When the Start of shift should be at or after, `endsOnOrBefore` — When the End of shift should be at or before, `shiftType` — Value to match ShiftType to\, `technicianId` — Unique Id of technician shift must apply to, `titleContains` — Text that must appear in the Title, `noteContains` — Text that must appear in the Note, `active` — What kind of items should be returned (only active items will be returned by def, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by the specified field:\
**Scope:** `tn.dis.technicianshifts:r`

### POST /tenant/{tenant}/technician-shifts
Creates new Technician Shift
**Body:** technicianIds, shiftType, title, start, end, note, timesheetCodeId, repeatType
**Scope:** `tn.dis.technicianshifts:w`

### POST /tenant/{tenant}/technician-shifts/bulk-delete
Deletes the technician shifts specified by the criteria
**Body:** start, end
**Scope:** `tn.dis.technicianshifts:w`

### GET /tenant/{tenant}/technician-shifts/{id}
Gets a specific technician shift
**Scope:** `tn.dis.technicianshifts:r`

### PATCH /tenant/{tenant}/technician-shifts/{id}
Updates Technician Shift
**Body:** shiftType, title, start, end, note, timesheetCodeId
**Scope:** `tn.dis.technicianshifts:w`

### DELETE /tenant/{tenant}/technician-shifts/{id}
Deletes the specified technician shift
**Scope:** `tn.dis.technicianshifts:w`

### GET /tenant/{tenant}/technician-skills
Gets a list of technician skills
**Params:** `technicianId` — Gets or sets the unique Id of the technician the skill must apply to., `active` — What kind of items should be returned (only active items will be returned by def, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Gets or sets the sorting configuration.
**Scope:** `tn.dis.technicianskills:r`

### PATCH /tenant/{tenant}/technician-skills
Assigns or replaces skills on a technician.
Returns the updated status and complete list of all technician skills after the operation.
**Body:** technicianId, skillIds, replaceExistingSkills
**Scope:** `tn.dis.technicianskills:w`

### POST /tenant/{tenant}/technician-skills
Creates a new skill and assigns it to a technician
**Body:** technicianId, name, active
**Scope:** `tn.dis.technicianskills:w`

### GET /tenant/{tenant}/technician-skills/{id}
Gets a specific technician skill
**Scope:** `tn.dis.technicianskills:r`

### DELETE /tenant/{tenant}/technician-skills/{id}
Deletes a technician skill association
**Scope:** `tn.dis.technicianskills:w`

### GET /tenant/{tenant}/technician-tracking
TechnicianTracking_Get
**Params:** `technicianId`* — Unique Id of technician that tracking url must apply to, `appointmentId`* — Unique Id of appointment that tracking url must apply to
**Scope:** `tn.dis.techniciantracking:r`

### GET /tenant/{tenant}/zones
Gets a list of zones
**Params:** `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `createdBefore` — Return items created before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `active` — What kind of items should be returned (only active items will be returned by def, `sort` — Applies sorting by the specified field:\
**Scope:** `tn.dis.zones:r`

### POST /tenant/{tenant}/zones
Creates a new zone
**Body:** name, zips, cities, territoryNumbers, locnNumbers, serviceDaysEnabled, serviceDaysIds, businessUnits
**Scope:** `tn.dis.zones:w`

### GET /tenant/{tenant}/zones/{id}
Gets a specific zone
**Scope:** `tn.dis.zones:r`

### PATCH /tenant/{tenant}/zones/{zoneId}
Updates an existing zone
**Body:** name, zips, cities, territoryNumbers, locnNumbers, serviceDaysEnabled, serviceDaysIds, businessUnits
**Scope:** `tn.dis.zones:w`

### DELETE /tenant/{tenant}/zones/{zoneId}
Deletes a zone
**Scope:** `tn.dis.zones:w`

---

## Equipment Systems
**Base:** `https://api.servicetitan.io/equipmentsystems/v2`
**File:** `tenant-equipment-systems-v2 (1).json`

### GET /tenant/{tenant}/equipment-types
Gets a list of equipment types
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `name` — Filters records by name (case-insensitive "contains" operation), `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by the specified field:\, `active` — What kind of items should be returned (only active items will be returned by def
**Scope:** `tn.eqs.equipmenttypes:r`

### POST /tenant/{tenant}/equipment-types
Creates a new equipment type
**Body:** name
**Scope:** `tn.eqs.equipmenttypes:w`

### GET /tenant/{tenant}/equipment-types/{id}
Gets equipment type specified by ID
**Scope:** `tn.eqs.equipmenttypes:r`

### PATCH /tenant/{tenant}/equipment-types/{id}
Updates an existing equipment type
**Body:** name, active
**Scope:** `tn.eqs.equipmenttypes:w`

### GET /tenant/{tenant}/export/installed-equipment
Export_ExportInstalledEquipment
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.eqs.installedequipment:r`

### GET /tenant/{tenant}/installed-equipment
InstalledEquipment_GetList
**Params:** `locationIds`, `ids` — Perform lookup by multiple IDs (maximum 50), `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by the specified field:\, `active` — What kind of items should be returned (only active items will be returned by def
**Scope:** `tn.eqs.installedequipment:r`

### POST /tenant/{tenant}/installed-equipment
InstalledEquipment_Create
**Body:** locationId, name, equipmentTypeId, status, installedOn, actualReplacementDate, manufacturedOn, serialNumber
**Scope:** `tn.eqs.installedequipment:w`

### POST /tenant/{tenant}/installed-equipment/attachments
InstalledEquipment_PostAttachment
**Body:** file
**Scope:** `tn.eqs.installedequipment:w`

### GET /tenant/{tenant}/installed-equipment/attachments
InstalledEquipment_Get2
**Params:** `path`
**Scope:** `tn.eqs.installedequipment:r`

### ⭐ GET /tenant/{tenant}/installed-equipment/custom-field-types
InstalledEquipment_GetCustomFieldTypes
**Params:** `descending`*, `createdBefore`, `createdOnOrAfter`, `modifiedBefore`, `modifiedOnOrAfter`, `sortBy`
**Scope:** `tn.eqs.installedequipment:r`

### GET /tenant/{tenant}/installed-equipment/{id}
InstalledEquipment_Get
**Scope:** `tn.eqs.installedequipment:r`

### PATCH /tenant/{tenant}/installed-equipment/{id}
InstalledEquipment_Update
**Body:** name, equipmentTypeId, status, installedOn, actualReplacementDate, manufacturedOn, serialNumber, barcodeId
**Scope:** `tn.eqs.installedequipment:w`

---

## Equipment Systems
**Base:** `https://api.servicetitan.io/equipmentsystems/v2`
**File:** `tenant-equipment-systems-v2.json`

### GET /tenant/{tenant}/equipment-types
Gets a list of equipment types
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `name` — Filters records by name (case-insensitive "contains" operation), `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by the specified field:\, `active` — What kind of items should be returned (only active items will be returned by def
**Scope:** `tn.eqs.equipmenttypes:r`

### POST /tenant/{tenant}/equipment-types
Creates a new equipment type
**Body:** name
**Scope:** `tn.eqs.equipmenttypes:w`

### GET /tenant/{tenant}/equipment-types/{id}
Gets equipment type specified by ID
**Scope:** `tn.eqs.equipmenttypes:r`

### PATCH /tenant/{tenant}/equipment-types/{id}
Updates an existing equipment type
**Body:** name, active
**Scope:** `tn.eqs.equipmenttypes:w`

### GET /tenant/{tenant}/export/installed-equipment
Export_ExportInstalledEquipment
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.eqs.installedequipment:r`

### GET /tenant/{tenant}/installed-equipment
InstalledEquipment_GetList
**Params:** `locationIds`, `ids` — Perform lookup by multiple IDs (maximum 50), `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by the specified field:\, `active` — What kind of items should be returned (only active items will be returned by def
**Scope:** `tn.eqs.installedequipment:r`

### POST /tenant/{tenant}/installed-equipment
InstalledEquipment_Create
**Body:** locationId, name, equipmentTypeId, status, installedOn, actualReplacementDate, manufacturedOn, serialNumber
**Scope:** `tn.eqs.installedequipment:w`

### POST /tenant/{tenant}/installed-equipment/attachments
InstalledEquipment_PostAttachment
**Body:** file
**Scope:** `tn.eqs.installedequipment:w`

### GET /tenant/{tenant}/installed-equipment/attachments
InstalledEquipment_Get2
**Params:** `path`
**Scope:** `tn.eqs.installedequipment:r`

### ⭐ GET /tenant/{tenant}/installed-equipment/custom-field-types
InstalledEquipment_GetCustomFieldTypes
**Params:** `descending`*, `createdBefore`, `createdOnOrAfter`, `modifiedBefore`, `modifiedOnOrAfter`, `sortBy`
**Scope:** `tn.eqs.installedequipment:r`

### GET /tenant/{tenant}/installed-equipment/{id}
InstalledEquipment_Get
**Scope:** `tn.eqs.installedequipment:r`

### PATCH /tenant/{tenant}/installed-equipment/{id}
InstalledEquipment_Update
**Body:** name, equipmentTypeId, status, installedOn, actualReplacementDate, manufacturedOn, serialNumber, barcodeId
**Scope:** `tn.eqs.installedequipment:w`

---

## Findings
**Base:** `https://api.servicetitan.io/findings/v2`
**File:** `tenant-findings-v2.json`

### POST /tenant/{tenant}/assets
Uploads a file and returns the asset path for use in /findings endpoint requests
**Body:** file
**Scope:** `tn.fdgs.assets:w`

### GET /tenant/{tenant}/assets
Downloads an asset by path. Redirects to a temporary download URL
**Params:** `path`
**Scope:** `tn.fdgs.assets:r`

### GET /tenant/{tenant}/location-findings
Gets a list of findings
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by the specified field:\, `active` — What kind of items should be returned (only active items will be returned by def, `locationId` — Filters by location ID, `sourceJobId` — Filters by source job ID, `installedEquipmentId` — Filters by installed equipment ID
**Scope:** `tn.fdgs.locationfindings:r`

### POST /tenant/{tenant}/location-findings
Creates a new finding to document an issue or observation at a customer location
**Body:** locationId, name, description, urgencyLevel, recommendedSolution, internalNotes, installedEquipmentId, sourceJobId
**Scope:** `tn.fdgs.locationfindings:w`

### GET /tenant/{tenant}/location-findings/{id}
Gets finding specified by ID
**Scope:** `tn.fdgs.locationfindings:r`

### PATCH /tenant/{tenant}/location-findings/{id}
Updates a finding
**Body:** name, description, urgencyLevel, recommendedSolution, internalNotes, archived, active
**Scope:** `tn.fdgs.locationfindings:w`

### GET /tenant/{tenant}/location-findings/{id}/attachments
Gets a paginated list of attachments for a finding
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `sort` — Applies sorting by the specified field:\
**Scope:** `tn.fdgs.locationfindings:r`

### POST /tenant/{tenant}/location-findings/{id}/attachments
Creates a new attachment for a finding
**Body:** fileName, url, type
**Scope:** `tn.fdgs.locationfindings:w`

### GET /tenant/{tenant}/location-findings/{id}/attachments/{attachmentId}
Gets an attachment for a finding by ID
**Scope:** `tn.fdgs.locationfindings:r`

### PATCH /tenant/{tenant}/location-findings/{id}/attachments/{attachmentId}
Updates an attachment associated with a finding
**Body:** fileName, url, type
**Scope:** `tn.fdgs.locationfindings:w`

### DELETE /tenant/{tenant}/location-findings/{id}/attachments/{attachmentId}
Removes an attachment associated with a finding
**Scope:** `tn.fdgs.locationfindings:w`

---

## Forms
**Base:** `https://api.servicetitan.io/forms/v2`
**File:** `tenant-forms-v2.json`

### GET /tenant/{tenant}/forms
Retrieve Form data
**Params:** `hasConditionalLogic`, `hasTriggers`, `name`, `status` — Values: [Any, Published, Unpublished], `ids`, `active` — Values: [True, Any, False], `createdBefore`, `createdOnOrAfter`, `modifiedBefore`, `modifiedOnOrAfter`, `sort`
**Scope:** `tn.frm.forms:r`

### ⭐ GET /tenant/{tenant}/jobs/attachment/{id}
Downloads a specified job attachment.
**Scope:** `tn.frm.jobs:r`

### ⭐ POST /tenant/{tenant}/jobs/{id}/attachments
Creates a Attachment on the specified Job
**Body:** file
**Scope:** `tn.frm.jobs:w`

### ⭐ GET /tenant/{tenant}/jobs/{jobId}/attachments
Gets Attachments on the specified Job
**Params:** `createdBefore`, `createdOnOrAfter`, `sort`
**Scope:** `tn.frm.jobs:r`

### GET /tenant/{tenant}/submissions
Retrieve Form Submission Data
**Params:** `formIds` — Form Ids (comma separated Ids), `active` — Values: [True, Any, False], `createdById` — Creator user Id, `status` — Values: [Started, Completed, Any], `submittedOnOrAfter` — Submission modified date on or after, `submittedBefore` — Submission modified date before, `ownerType` — Values: [Job, Call, Customer, Location, Equipment, Technician, JobAppointment, M, `owners` — List of owner object (one of Job,Customer,Location,Equipment,Call,Technician) {', `sort` — Applies sorting by the specified field:\
**Scope:** `tn.frm.submissions:r`

---

## Inventory
**Base:** `https://api.servicetitan.io/inventory/v2`
**File:** `tenant-inventory-v2.json`

### GET /tenant/{tenant}/adjustments
Get a list of inventory adjustments
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `active` — What kind of items should be returned (only active items will be returned by def, `externalDataApplicationGuid` — If this guid is provided, external data corresponding to, `externalDataKey` — Performs lookup by external data key, 'externalDataValues' must also be provided, `externalDataValues` — Performs lookup by external data values (maximum 50), 'externalDataKey' must als, `number` — Number filter, `referenceNumber` — Reference number filter, `batchId` — BatchId filter, `invoiceIds` — Filter by a collection of invoice Ids, `inventoryLocationIds` — Filter by a collection of inventory location Ids, `adjustmentTypes` — Filter by a collection of adjustment types, `businessUnitIds` — Filter by a collection of business unit Ids, `syncStatuses` — Filter by a collection of sync statues, `customFields.Fields` — Collection of custom field pairs (name, value) to filter by, `customFields.Operator` — Can be "Or" or "And"\, `dateOnOrAfter` — Return adjustments with date on or after certain date/time, `dateBefore` — Return adjustments with date before certain date/time, `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `createdBefore` — Return items created before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `sort` — Applies sorting by the specified field:\
**Scope:** `tn.inv.adjustments:r`

### ⭐ PATCH /tenant/{tenant}/adjustments/custom-fields
Update custom fields on adjustments
**Body:** operations
**Scope:** `tn.inv.adjustments:w`

### PATCH /tenant/{tenant}/adjustments/{id}
Update an existing adjustment
**Body:** externalData
**Scope:** `tn.inv.adjustments:w`

### GET /tenant/{tenant}/export/adjustments
Provides export feed for adjustments
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.inv.adjustments:r`

### GET /tenant/{tenant}/export/purchase-orders
Provides export feed for purchase orders
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.inv.purchaseorders:r`

### GET /tenant/{tenant}/export/returns
Provides export feed for returns
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.inv.returns:r`

### GET /tenant/{tenant}/export/transfers
Provides export feed for transfers
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.inv.transfers:r`

### GET /tenant/{tenant}/inventory-templates
Get a list of inventory template details
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `active` — What kind of items should be returned (only active items will be returned by def, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by specified fields
**Scope:** `tn.inv.inventorytemplates:r`

### GET /tenant/{tenant}/purchase-order-markups
Get a list of purchase order markups
**Params:** `ids`, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by the specified field:\
**Scope:** `tn.inv.purchaseordermarkups:r`

### POST /tenant/{tenant}/purchase-order-markups
Create a new purchase order markup
**Body:** from, to, percent
**Scope:** `tn.inv.purchaseordermarkups:w`

### GET /tenant/{tenant}/purchase-order-markups/{id}
Get purchase order markup by Id
**Scope:** `tn.inv.purchaseordermarkups:r`

### PATCH /tenant/{tenant}/purchase-order-markups/{id}
Update an existing purchase order markup
**Body:** from, to, percent
**Scope:** `tn.inv.purchaseordermarkups:w`

### DELETE /tenant/{tenant}/purchase-order-markups/{id}
Deletes aan existing purchase order markup.
**Scope:** `tn.inv.purchaseordermarkups:w`

### POST /tenant/{tenant}/purchase-order-types
Create a new Purchase Order Type
**Body:** name, active, includeInPoScreen, automaticallyReceive, displayToTechnician, excludeTaxFromJobCosting, impactToTechnicianPayroll, allowTechniciansToSendPo
**Scope:** `tn.inv.purchaseordertypes:w`

### GET /tenant/{tenant}/purchase-order-types
Get a list of purchase order types
**Params:** `active` — What kind of items should be returned (only active items will be returned by def, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by the specified field:\
**Scope:** `tn.inv.purchaseordertypes:r`

### PATCH /tenant/{tenant}/purchase-order-types/{id}
Update an existing purchase order type
**Body:** active, name, includeInPoScreen, automaticallyReceive, displayToTechnician, excludeTaxFromJobCosting, impactToTechnicianPayroll, allowTechniciansToSendPo
**Scope:** `tn.inv.purchaseordertypes:w`

### POST /tenant/{tenant}/purchase-orders
Create a new purchase order
**Body:** vendorId, typeId, businessUnitId, inventoryLocationId, jobId, technicianId, projectId, budgetCodeId
**Scope:** `tn.inv.purchaseorders:w`

### GET /tenant/{tenant}/purchase-orders
Get a list of purchase orders
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `status` — Filters by PO status, `number` — Filters by PO number , `jobId` — Filters by JobId associated with PO, `jobIds` — Filters by JobIds associated with PO, `technicianId` — Filter by TechnicianId associated with PO, `projectId` — Filter by ProjectId associated with PO, `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `createdBefore` — Return items created before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `dateOnOrAfter` — Return POs with date on or after certain date/time, `dateBefore` — Return POs with date before certain date/time, `sentOnOrAfter` — Return POs sent on or after certain date/time, `sentBefore` — Return POs sent before certain date/time, `sort` — Applies sorting by the specified field:\
**Scope:** `tn.inv.purchaseorders:r`

### GET /tenant/{tenant}/purchase-orders/requests
Get a list of purchase order requests
**Params:** `ids`, `requestStatus` — Filters by PO request status, `requestNumber` — Filters by PO request number , `jobId` — Filters by JobId associated with PO request, `jobIds` — Filters by JobIds associated with PO request, `technicianId` — Filter by TechnicianId associated with PO request, `projectId` — Filter by ProjectId associated with PO request, `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `createdBefore` — Return items created before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `dateOnOrAfter` — Return PO requests with date on or after certain date/time, `dateBefore` — Return PO requests with date before certain date/time, `sort` — Applies sorting by the specified field:\
**Scope:** `tn.inv.purchaseorders:r`

### PATCH /tenant/{tenant}/purchase-orders/requests/{id}/approve
Approve purchase order request
**Scope:** `tn.inv.purchaseorders:w`

### PATCH /tenant/{tenant}/purchase-orders/requests/{id}/reject
Reject purchase order request
**Body:** rejectionReason
**Scope:** `tn.inv.purchaseorders:w`

### GET /tenant/{tenant}/purchase-orders/{id}
Get purchase order by Id
**Scope:** `tn.inv.purchaseorders:r`

### PATCH /tenant/{tenant}/purchase-orders/{id}
Update an existing purchase order
**Body:** vendorId, typeId, businessUnitId, inventoryLocationId, jobId, technicianId, projectId, budgetCodeId
**Scope:** `tn.inv.purchaseorders:w`

### PATCH /tenant/{tenant}/purchase-orders/{id}/cancellation
Cancel a purchase order
**Body:** canceledReason
**Scope:** `tn.inv.purchaseorders:w`

### GET /tenant/{tenant}/receipts
Get a list of receipts
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `active` — What kind of items should be returned (only active items will be returned by def, `number` — Number filter, `vendorInvoiceNumber` — Vendor invoice number filter, `billId` — BillId filter, `batchId` — BatchId filter, `vendorIds` — Filter by a collection of vendors, `businessUnitIds` — Filter by a collection of business units, `inventoryLocationIds` — Filter by a collection of inventory locations, `purchaseOrderIds` — Filter by a collection of purchase orders, `syncStatuses` — Filter by a collection of sync statuses, `customFields.Fields` — Collection of custom field pairs (name, value) to filter by, `customFields.Operator` — Can be "Or" or "And"\, `receivedOnOrAfter` — Return receipts with received date on or after certain date/time, `receivedBefore` — Return receipts with received date before certain date/time, `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `createdBefore` — Return items created before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `sort` — Applies sorting by the specified field:\
**Scope:** `tn.inv.receipts:r`

### POST /tenant/{tenant}/receipts
Create a receipt for Purchase Order
**Body:** purchaseOrderId, jobId, dateReceived, vendorDocumentNumber, memo, tax, shipping, budgetCodeId
**Scope:** `tn.inv.receipts:w`

### ⭐ PATCH /tenant/{tenant}/receipts/custom-fields
Update custom fields on receipts
**Body:** operations
**Scope:** `tn.inv.receipts:w`

### PATCH /tenant/{tenant}/receipts/{id}/cancellation
Cancel the receipts
**Params:** `id`
**Body:** canceledReason
**Scope:** `tn.inv.receipts:w`

### POST /tenant/{tenant}/return-types
Create a new Return Type
**Body:** name, automaticallyReceiveVendorCredit, includeInSalesTax, isDefault, isDefaultForConsignment
**Scope:** `tn.inv.returntypes:w`

### GET /tenant/{tenant}/return-types
Returns the list of Return Types
**Params:** `activeOnly`* — Filter by active only, `name` — Filter by name, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by specified fields
**Scope:** `tn.inv.returntypes:r`

### PATCH /tenant/{tenant}/return-types/{id}
Update an existing Return Type
**Body:** id, active, name, automaticallyReceiveVendorCredit, includeInSalesTax, isDefault, isDefaultForConsignment
**Scope:** `tn.inv.returntypes:w`

### GET /tenant/{tenant}/returns
Get a list of returns
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `active` — What kind of items should be returned (only active items will be returned by def, `number` — Number filter, `referenceNumber` — Reference number filter, `jobId` — Job filter, `purchaseOrderId` — Purchase order filter, `batchId` — Batch filter, `vendorIds` — Filter by a collection of vendors, `businessUnitIds` — Filter by a collection of business units, `inventoryLocationIds` — Filter by a collection of inventory locations, `syncStatuses` — Filter by a collection of sync statuses, `customFields.Fields` — Collection of custom field pairs (name, value) to filter by, `customFields.Operator` — Can be "Or" or "And"\, `returnDateOnOrAfter` — Filters by returns with return date on or after certain date/time, `returnDateBefore` — Filters by returns with return date before certain date/time, `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `createdBefore` — Return items created before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `sort` — Applies sorting by the specified field:\, `externalDataApplicationGuid` — If this guid is provided, external data corresponding to, `externalDataKey` — Performs lookup by external data key, 'externalDataValues' must also be provided, `externalDataValues` — Performs lookup by external data values (maximum 50), 'externalDataKey' must als
**Scope:** `tn.inv.returns:r`

### POST /tenant/{tenant}/returns
Create a Return
**Body:** vendorId, jobId, purchaseOrderId, returnTypeId, businessUnitId, budgetCodeId, referenceNumber, inventoryLocationId
**Scope:** `tn.inv.returns:w`

### ⭐ PATCH /tenant/{tenant}/returns/custom-fields
Update custom fields on returns
**Body:** operations
**Scope:** `tn.inv.returns:w`

### PATCH /tenant/{tenant}/returns/{id}
Update an existing Return
**Body:** returnTypeId, businessUnitId, referenceNumber, inventoryLocationId, returnDate, memo, tax, shipping
**Scope:** `tn.inv.returns:w`

### PATCH /tenant/{tenant}/returns/{id}/cancellation
Cancel a Return
**Body:** canceledReason
**Scope:** `tn.inv.returns:w`

### GET /tenant/{tenant}/transfers
Get a list of transfers
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `statuses` — Filter by a collection of statuses, `number` — Number filter, `referenceNumber` — Reference number filter, `batchId` — Batch filter, `transferTypeIds` — Filter by a collection of transfer types, `fromLocationIds` — Filter by a collection of From field locations, `toLocationIds` — Filter by a collection of To field locations , `syncStatuses` — Filter by a collection of sync statuses, `customFields.Fields` — Collection of custom field pairs (name, value) to filter by, `customFields.Operator` — Can be "Or" or "And"\, `dateOnOrAfter` — Return transfers with date on or after certain date/time, `dateBefore` — Return transfers with date before certain date/time, `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `createdBefore` — Return items created before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `sort` — Applies sorting by the specified field:\, `externalDataApplicationGuid` — If this guid is provided, external data corresponding to, `externalDataKey` — Performs lookup by external data key, 'externalDataValues' must also be provided, `externalDataValues` — Performs lookup by external data values (maximum 50), 'externalDataKey' must als
**Scope:** `tn.inv.transfers:r`

### ⭐ PATCH /tenant/{tenant}/transfers/custom-fields
Update custom fields on transfers
**Body:** operations
**Scope:** `tn.inv.transfers:w`

### PATCH /tenant/{tenant}/transfers/{id}
Update an existing Transfer
**Body:** externalData
**Scope:** `tn.inv.transfers:w`

### GET /tenant/{tenant}/trucks
Get a list of trucks
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `active` — What kind of items should be returned (only active items will be returned by def, `externalDataApplicationGuid` — If this guid is provided, external data corresponding to, `externalDataKey` — Performs lookup by external data key, 'externalDataValues' must also be provided, `externalDataValues` — Performs lookup by external data values (maximum 50), 'externalDataKey' must als, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by the specified field:\
**Scope:** `tn.inv.trucks:r`

### POST /tenant/{tenant}/trucks
Create a new truck
**Body:** name, memo, warehouseId, templateId, technicianIds, externalData
**Scope:** `tn.inv.trucks:w`

### PATCH /tenant/{tenant}/trucks/{id}
Update an existing truck
**Body:** name, active, memo, warehouseId, templateId, technicianIds, externalData
**Scope:** `tn.inv.trucks:w`

### POST /tenant/{tenant}/vendors
Create a new vendor
**Body:** name, active, memo, firstName, lastName, phone, email, fax
**Scope:** `tn.inv.vendors:w`

### GET /tenant/{tenant}/vendors
Get a list of vendors
**Params:** `ids` — Ids to filter by, `active` — What kind of items should be returned (only active items will be returned by def, `externalDataApplicationGuid` — If this guid is provided, external data corresponding to, `externalDataKey` — Performs lookup by external data key, 'externalDataValues' must also be provided, `externalDataValues` — Performs lookup by external data values (maximum 50), 'externalDataKey' must als, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `customField.Fields` — Collection of custom field pairs (name, value) to filter by, `customField.Operator` — Can be "Or" or "And"\, `sort` — Applies sorting by the specified field:\
**Scope:** `tn.inv.vendors:r`

### ⭐ GET /tenant/{tenant}/vendors/custom-fields
Returns a paginated list of filtered custom field types available for vendors
**Params:** `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort`
**Scope:** `tn.inv.vendors:r`

### ⭐ PATCH /tenant/{tenant}/vendors/custom-fields
Update custom fields on vendors
**Body:** operations
**Scope:** `tn.inv.vendors:w`

### GET /tenant/{tenant}/vendors/{id}
Get vendor by Id
**Params:** `externalDataApplicationGuid` — If this guid is provided, external data corresponding to, `externalDataKey` — Performs lookup by external data key, 'externalDataValues' must also be provided, `externalDataValues` — Performs lookup by external data values (maximum 50), 'externalDataKey' must als
**Scope:** `tn.inv.vendors:r`

### PATCH /tenant/{tenant}/vendors/{id}
Update an existing vendor
**Body:** name, active, memo, firstName, lastName, phone, email, fax
**Scope:** `tn.inv.vendors:w`

### GET /tenant/{tenant}/warehouses
Get a list of warehouses
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `active` — What kind of items should be returned (only active items will be returned by def, `externalDataApplicationGuid` — If this guid is provided, external data corresponding to, `externalDataKey` — Performs lookup by external data key, 'externalDataValues' must also be provided, `externalDataValues` — Performs lookup by external data values (maximum 50), 'externalDataKey' must als, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by the specified field:\
**Scope:** `tn.inv.warehouses:r`

### PATCH /tenant/{tenant}/warehouses/{id}
Update an existing warehouse
**Body:** externalData
**Scope:** `tn.inv.warehouses:w`

---

## Job Booking
**Base:** `https://api.servicetitan.io/jbce/v2`
**File:** `tenant-jbce-v2 (1).json`

### GET /tenant/{tenant}/call-reasons
Gets a list of call reasons
**Params:** `active` — What kind of items should be returned (only active items will be returned by def, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by the specified field:\
**Scope:** `tn.jbce.callreasons:r`

---

## Job Booking
**Base:** `https://api.servicetitan.io/jbce/v2`
**File:** `tenant-jbce-v2.json`

### GET /tenant/{tenant}/call-reasons
Gets a list of call reasons
**Params:** `active` — What kind of items should be returned (only active items will be returned by def, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by the specified field:\
**Scope:** `tn.jbce.callreasons:r`

---

## Job Planning and Management
**Base:** `https://api.servicetitan.io/jpm/v2`
**File:** `tenant-jpm-v2.json`

### ⭐ GET /tenant/{tenant}/appointments
Gets a list of appointments
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `active` — What kind of items should be returned (only active items will be returned by def, `jobId` — Return all appointments for this job, `projectId` — Return all appointments for jobs that are part of this project, `number` — Return all appointments with this appointment number, `status` — Return items with specified status AppointmentStatus\, `startsOnOrAfter` — Return appointments that start on or after the specified date/time (in UTC), `startsBefore` — Return appointments that start before the specified date/time (in UTC), `technicianId` — Return appointments this technician is assigned to, `customerId` — Return appointments for the specified Customer, `unused` — Return appointments that are unused, `modifiedBefore` — Return appointments modified before a certain date/time (in UTC), `modifiedOnOrAfter` — Return appointments modified on or after a certain date/time (in UTC), `createdOnOrAfter` — Return appointments created on or after a certain date/time (in UTC), `createdBefore` — Return appointments created before a certain date/time (in UTC), `sort` — Applies sorting by the specified field:\
**Scope:** `tn.jpm.appointments:r`

### ⭐ POST /tenant/{tenant}/appointments
Adds a new appointment to an existing job
**Body:** jobId, start, end, arrivalWindowStart, arrivalWindowEnd, technicianIds, specialInstructions
**Scope:** `tn.jpm.appointments:w`

### ⭐ GET /tenant/{tenant}/appointments/{id}
Gets appointment specified by ID
**Scope:** `tn.jpm.appointments:r`

### ⭐ DELETE /tenant/{tenant}/appointments/{id}
Deletes appointment with specified id.
**Scope:** `tn.jpm.appointments:w`

### ⭐ PUT /tenant/{tenant}/appointments/{id}/confirmation
Adds a confirmation to the specified appointment.
**Scope:** `tn.jpm.appointments:w`

### ⭐ DELETE /tenant/{tenant}/appointments/{id}/confirmation
Removes a confirmation to the specified appointment.
**Scope:** `tn.jpm.appointments:w`

### ⭐ PUT /tenant/{tenant}/appointments/{id}/hold
Puts the appointment on hold
**Body:** reasonId, memo
**Scope:** `tn.jpm.appointments:w`

### ⭐ DELETE /tenant/{tenant}/appointments/{id}/hold
Removes hold from the appointment
**Scope:** `tn.jpm.appointments:w`

### ⭐ PATCH /tenant/{tenant}/appointments/{id}/reschedule
Reschedule job appointment
**Body:** start, end, arrivalWindowStart, arrivalWindowEnd
**Scope:** `tn.jpm.appointments:w`

### ⭐ PUT /tenant/{tenant}/appointments/{id}/special-instructions
Updates special instructions for the specified appointment.
**Body:** specialInstructions
**Scope:** `tn.jpm.appointments:w`

### ⭐ POST /tenant/{tenant}/appointments/{id}/summaries
Sets an appointment summary (work performed log) for the specified appointment and technician.
Private preview: available for specific accounts only.
**Body:** notes, technicianId
**Scope:** `tn.jpm.appointments:w`

### ⭐ GET /tenant/{tenant}/export/appointments
Provides export feed for appointments
**Params:** `active` — What kind of items should be returned (all items will be returned by default)\, `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.jpm.appointments:r`

### ⭐ GET /tenant/{tenant}/export/job-canceled-logs
Provides export feed for job canceled logs
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.jpm.jobcanceledlogs:r`

### ⭐ GET /tenant/{tenant}/export/job-history
Provides export feed for job status history.
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.jpm.jobhistory:r`

### ⭐ GET /tenant/{tenant}/export/job-notes
Provides export feed for job notes
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.jpm.jobnotes:r`

### ⭐ GET /tenant/{tenant}/export/jobs
Provides export feed for jobs
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.jpm.jobs:r`

### GET /tenant/{tenant}/export/project-notes
Provides export feed for project notes
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.jpm.projectnotes:r`

### GET /tenant/{tenant}/export/projects
Provides export feed for projects
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.jpm.projects:r`

### ⭐ GET /tenant/{tenant}/job-cancel-reasons
Gets a list of job cancel reasons
**Params:** `active` — What kind of items should be returned (active and inactive items will be returne, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by the specified field:\
**Scope:** `tn.jpm.jobcancelreasons:r`

### ⭐ GET /tenant/{tenant}/job-hold-reasons
Gets a list of job hold reasons
**Params:** `active` — What kind of items should be returned (active and inactive items will be returne, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by the specified field:\
**Scope:** `tn.jpm.jobholdreasons:r`

### ⭐ GET /tenant/{tenant}/job-types
Gets a list of job types
**Params:** `name` — Filters by job type name, `minDuration` — Minimum length of time for this job type (in seconds), `maxDuration` — Maximum length of time for this job type (in seconds), `priority` — Level of urgency for this type of job, `ids` — Perform lookup by multiple IDs (maximum 50), `active` — What kind of items should be returned (only active items will be returned by def, `orderBy` — Orders results by a field. Supported fields are "id", "modifiedOn", and "created, `orderByDirection` — Specifies order direction of results. Supported values are "asc"/"ascending" and, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `externalDataApplicationGuid` — If this guid is provided, external data corresponding to
**Scope:** `tn.jpm.jobtypes:r`

### ⭐ POST /tenant/{tenant}/job-types
Creates a job type
**Body:** name, businessUnitIds, skills, tagTypeIds, priority, duration, soldThreshold, class
**Scope:** `tn.jpm.jobtypes:w`

### ⭐ GET /tenant/{tenant}/job-types/{id}
Gets a job type by ID
**Params:** `externalDataApplicationGuid` — If this guid is provided, external data corresponding to
**Scope:** `tn.jpm.jobtypes:r`

### ⭐ PATCH /tenant/{tenant}/job-types/{id}
Update a job type
**Body:** name, businessUnitIds, skills, tagTypeIds, priority, duration, soldThreshold, class
**Scope:** `tn.jpm.jobtypes:w`

### ⭐ POST /tenant/{tenant}/jobs
Creates a job
**Body:** customerId, locationId, projectId, businessUnitId, jobGeneratedLeadSource, jobTypeId, priority, campaignId
**Scope:** `tn.jpm.jobs:w`

### ⭐ GET /tenant/{tenant}/jobs
Gets a list of jobs
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `number` — Filters by job number, `projectId` — Filters by project ID, `bookingId` — Filters by booking ID that resulted in this job, `jobStatus` — Filters by job status, `appointmentStatus` — Filters by appointment status. Return a job if it has any appointment with the s, `priority` — Filters by priority. Supported priorities are "Low", "Normal", "High", "Urgent", `firstAppointmentStartsOnOrAfter` — Return jobs whose first appointment starts on or after date/time (in UTC). Use w, `firstAppointmentStartsBefore` — Return jobs whose first appointment starts before date/time (in UTC), `appointmentStartsOnOrAfter` — Return jobs if any appointment starts after date/time (in UTC), `appointmentStartsBefore` — Return jobs if any appointment starts after date/time (in UTC), `technicianId` — Return jobs if technician is assigned to any appointment, `customerId` — Filters by job's customer ID, `locationId` — Filters by job's location ID, `soldById` — Filters by the technician who sold the job, `jobTypeId` — Filters by job type ID, `campaignId` — Filters by job's campaign ID, `businessUnitId` — Filters by job's business unit ID, `invoiceId` — Filters by job's invoice ID, `createdFromEstimateId` — Filters by the sold estimate ID from which the job was created, `estimateIds` — Filters by estimate IDs that are related to the job, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `completedOnOrAfter` — Return jobs that are completed after a certain date/time (in UTC), `completedBefore` — Return jobs that are completed before a certain date/time (in UTC), `tagTypeIds` — Return jobs that have at least one of provided Tag Type assigned, `equipmentIds` — Return jobs that have at least one of provided equipment items attached, `sort` — Applies sorting by the specified field:\, `externalDataApplicationGuid` — If this guid is provided, external data corresponding to, `externalDataKey` — Performs lookup by external data key, 'externalDataValues' must also be provided, `externalDataValues` — Performs lookup by external data values (maximum 50), 'externalDataKey' must als, `hasUnusedAppointments` — If set to true, return jobs that have unused appointments.
**Scope:** `tn.jpm.jobs:r`

### ⭐ GET /tenant/{tenant}/jobs/cancel-reasons
Gets a list of cancel reasons for specific jobs
**Params:** `ids`* — Perform lookup by multiple IDs (maximum 50)
**Scope:** `tn.jpm.jobs:r`

### ⭐ GET /tenant/{tenant}/jobs/custom-fields
Returns a list of custom field types available for projects
**Params:** `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by the specified field: Id, Name.
**Scope:** `tn.jpm.jobs:r`

### ⭐ GET /tenant/{tenant}/jobs/hold-reasons
Gets a list of hold reasons for specific jobs
**Params:** `ids`* — Perform lookup by multiple IDs (maximum 50)
**Scope:** `tn.jpm.jobs:r`

### ⭐ GET /tenant/{tenant}/jobs/{id}
Gets a job by ID
**Params:** `externalDataApplicationGuid` — If this guid is provided, external data corresponding to
**Scope:** `tn.jpm.jobs:r`

### ⭐ PATCH /tenant/{tenant}/jobs/{id}
Updates a job
**Body:** customerId, locationId, businessUnitId, jobGeneratedLeadSource, jobTypeId, priority, campaignId, summary
**Scope:** `tn.jpm.jobs:w`

### ⭐ GET /tenant/{tenant}/jobs/{id}/booked-log
Get booked log for the specified job
**Scope:** `tn.jpm.jobs:r`

### ⭐ PUT /tenant/{tenant}/jobs/{id}/cancel
Cancels a job
**Body:** reasonId, memo
**Scope:** `tn.jpm.jobs:w`

### ⭐ GET /tenant/{tenant}/jobs/{id}/canceled-log
Get a list of cancelled logs for the specified job
**Scope:** `tn.jpm.jobs:r`

### ⭐ GET /tenant/{tenant}/jobs/{id}/equipment
Gets the list of equipment IDs attached to the specified job
**Scope:** `tn.jpm.jobs:r`

### ⭐ POST /tenant/{tenant}/jobs/{id}/equipment
Attaches one or more equipment items to the specified job.
Returns the updated list of all attached equipment IDs.
**Body:** equipmentIds
**Scope:** `tn.jpm.jobs:w`

### ⭐ DELETE /tenant/{tenant}/jobs/{id}/equipment
Detaches one or more equipment items from the specified job.
Returns 204 No Content on success.
**Body:** equipmentIds
**Scope:** `tn.jpm.jobs:w`

### ⭐ DELETE /tenant/{tenant}/jobs/{id}/equipment/{equipmentId}
Detaches a single equipment item from the specified job.
Returns 204 No Content on success; 404 if the equipment is not attached to the job.
**Scope:** `tn.jpm.jobs:w`

### ⭐ GET /tenant/{tenant}/jobs/{id}/history
Gets a list of history entries for the specified job
**Scope:** `tn.jpm.jobs:r`

### ⭐ GET /tenant/{tenant}/jobs/{id}/notes
Gets a list of notes on the specified job
**Scope:** `tn.jpm.jobs:r`

### ⭐ POST /tenant/{tenant}/jobs/{id}/notes
Creates a note on the specified job
**Body:** text, pinToTop
**Scope:** `tn.jpm.jobs:w`

### ⭐ PUT /tenant/{tenant}/jobs/{id}/remove-cancellation
Removes cancellation from a job
**Scope:** `tn.jpm.jobs:w`

### GET /tenant/{tenant}/project-statuses
Gets a list of project statuses
**Params:** `name` — Filters by project status name, `ids` — Perform lookup by multiple IDs (maximum 50), `sort` — Applies sorting by the specified field:\, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC)
**Scope:** `tn.jpm.projectstatuses:r`

### GET /tenant/{tenant}/project-statuses/{id}
Gets a project status by ID
**Scope:** `tn.jpm.projectstatuses:r`

### GET /tenant/{tenant}/project-substatuses
Gets a list of project sub statuses
**Params:** `name` — Filters by project sub status name, `statusId` — Filters by parent project status id, `ids` — Perform lookup by multiple IDs (maximum 50), `sort` — Applies sorting by the specified field:\, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `active` — What kind of items should be returned (active items will be returned by default)
**Scope:** `tn.jpm.projectsubstatuses:r`

### GET /tenant/{tenant}/project-substatuses/{id}
Gets a project sub status by ID
**Scope:** `tn.jpm.projectsubstatuses:r`

### GET /tenant/{tenant}/project-types
Gets a list of project types
**Scope:** `tn.jpm.projecttypes:r`

### GET /tenant/{tenant}/project-types/{id}
Gets a project type by ID
**Scope:** `tn.jpm.projecttypes:r`

### GET /tenant/{tenant}/projects
Gets a list of projects
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `customerId` — Filters by customer ID, `locationId` — Filters by location ID, `projectTypeId` — Return projects if it contains the specified project type, `invoiceId` — Return projects if it contains the specified invoice, `technicianId` — Return project if technician is assigned to any appointments on any job in the p, `jobId` — Return project if it contains the specified job, `appointmentId` — Return project if it contains the specified appointment in the project's jobs, `projectManagerIds` — Filters by id of managers for matching project, `businessUnitIds` — Returns projects which have at least one of the provided business units assigned, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `startsBefore` — Return projects that start before date, `startsOnOrAfter` — Return projects that start on or after date, `completedBefore` — Return projects that are completed before date, `completedOnOrAfter` — Return projects that are completed on or after date, `targetCompletionDateBefore` — Return projects whose target completion date is before date, `targetCompletionDateOnOrAfter` — Return projects whose target completion date is on or after date, `modifiedBefore` — Return projects whose last modification date is before date, `modifiedOnOrAfter` — Return projects whose last modification date is on or after date, `status` — Returns projects which have one of the provided statuses., `sort` — Applies sorting by the specified field:\, `externalDataApplicationGuid` — If this guid is provided, external data corresponding to, `externalDataKey` — Performs lookup by external data key, 'externalDataValues' must also be provided, `externalDataValues` — Performs lookup by external data values (maximum 50), 'externalDataKey' must als
**Scope:** `tn.jpm.projects:r`

### POST /tenant/{tenant}/projects
Creates a New Project
**Body:** locationId, customerId, projectTypeId, projectManagerIds, name, summary, statusId, subStatusId
**Scope:** `tn.jpm.projects:w`

### ⭐ GET /tenant/{tenant}/projects/custom-fields
Returns a list of custom field types available for projects
**Params:** `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by the specified field: Id, Name.
**Scope:** `tn.jpm.projects:r`

### ⭐ POST /tenant/{tenant}/projects/detach-job/{jobId}
Detaches Job from the project
**Scope:** `tn.jpm.projects:w`

### GET /tenant/{tenant}/projects/{id}
Gets a project by ID
**Params:** `externalDataApplicationGuid` — If this guid is provided, external data corresponding to
**Scope:** `tn.jpm.projects:r`

### PATCH /tenant/{tenant}/projects/{id}
Update a project
**Body:** projectManagerIds, jobIds, businessUnitIds, name, summary, statusId, subStatusId, projectTypeId
**Scope:** `tn.jpm.projects:w`

### ⭐ POST /tenant/{tenant}/projects/{id}/attach-job/{jobId}
Attaches Job to the specified project
**Scope:** `tn.jpm.projects:w`

### GET /tenant/{tenant}/projects/{id}/notes
Gets a list of notes on the specified project
**Scope:** `tn.jpm.projects:r`

### POST /tenant/{tenant}/projects/{id}/notes
Creates a note on the specified project
**Body:** text, pinToTop
**Scope:** `tn.jpm.projects:w`

### GET /tenant/{tenant}/work-breakdown-structure/budget-codes
BudgetCodes_ListCompanyBudgetCodes
**Params:** `budgetCodeIds`, `segmentIds`, `segmentItemIds`
**Scope:** `tn.jpm.budgetcodes:r`

### POST /tenant/{tenant}/work-breakdown-structure/budget-codes
BudgetCodes_CreateBudgetCode
**Body:** segmentItemIds
**Scope:** `tn.jpm.budgetcodes:w`

### POST /tenant/{tenant}/work-breakdown-structure/budget-codes/batch
BudgetCodes_CreateBudgetCodesBatch
**Scope:** `tn.jpm.budgetcodes:w`

### GET /tenant/{tenant}/work-breakdown-structure/budget-codes/match
BudgetCodes_MatchCompanyBudgetCodes
**Params:** `codes`*
**Scope:** `tn.jpm.budgetcodes:r`

### POST /tenant/{tenant}/work-breakdown-structure/budget-codes/partial
BudgetCodes_CreateBudgetCodePartial
**Body:** segments
**Scope:** `tn.jpm.budgetcodes:w`

### POST /tenant/{tenant}/work-breakdown-structure/budget-codes/partial/batch
BudgetCodes_CreateBudgetCodesPartialBatch
**Scope:** `tn.jpm.budgetcodes:w`

### GET /tenant/{tenant}/work-breakdown-structure/projects/{projectId}/budget-codes
BudgetCodes_ListProjectBudgetCodes
**Params:** `budgetCodeIds`, `segmentIds`, `segmentItemIds`
**Scope:** `tn.jpm.budgetcodes:r`

### GET /tenant/{tenant}/work-breakdown-structure/projects/{projectId}/budget-codes/match
BudgetCodes_MatchProjectBudgetCodes
**Params:** `codes`*
**Scope:** `tn.jpm.budgetcodes:r`

### GET /tenant/{tenant}/work-breakdown-structure/projects/{projectId}/segments
BudgetCodes_ListProjectSegments
**Scope:** `tn.jpm.segments:r`

### GET /tenant/{tenant}/work-breakdown-structure/projects/{projectId}/segments/{segmentId}/items
BudgetCodes_ListProjectSegmentItems
**Params:** `includeChildren`
**Scope:** `tn.jpm.segments:r`

### GET /tenant/{tenant}/work-breakdown-structure/projects/{projectId}/segments/{segmentId}/items/{segmentItemId}/children
BudgetCodes_ListProjectSegmentItemChildren
**Params:** `includeChildren`
**Scope:** `tn.jpm.segments:r`

### GET /tenant/{tenant}/work-breakdown-structure/segments
BudgetCodes_ListCompanySegments
**Scope:** `tn.jpm.segments:r`

### GET /tenant/{tenant}/work-breakdown-structure/segments/{segmentId}/items
BudgetCodes_ListCompanySegmentItems
**Params:** `includeChildren`
**Scope:** `tn.jpm.segments:r`

### GET /tenant/{tenant}/work-breakdown-structure/segments/{segmentId}/items/{segmentItemId}/children
BudgetCodes_ListCompanySegmentItemChildren
**Params:** `includeChildren`
**Scope:** `tn.jpm.segments:r`

---

## Marketing Ads
**Base:** `https://api.servicetitan.io/marketingads/v2`
**File:** `tenant-marketing-ads-v2.json`

### GET /tenant/{tenant}/attributed-leads
Returns attributed leads data.
**Params:** `fromUtc`* — Gets or sets the start date and time in UTC for the filtering period., `toUtc`* — Gets or sets the end date and time in UTC for the filtering period., `leadType` — Gets or sets the type of lead for filtering purposes. Possible values are:
**Scope:** `tn.mads.attributedleads:r`

### GET /tenant/{tenant}/capacity-warnings
Returns all capacity awareness warnings.
**Scope:** `tn.mads.capacitywarnings:r`

### POST /tenant/{tenant}/external-call-attributions
Attributes an external call (possibly coming from Call Tracking Software) to a web session.
**Body:** webSessionData, externalCallData
**Scope:** `tn.mads.externalcallattributions:w`

### ⭐ POST /tenant/{tenant}/job-attributions
Attributes a job to a web session.
**Body:** webSessionData, jobId
**Scope:** `tn.mads.jobattributions:w`

### GET /tenant/{tenant}/performance
Returns performance data.
**Params:** `fromUtc`* — Gets or sets the start date and time in UTC for the filtering period., `toUtc`* — Gets or sets the end date and time in UTC for the filtering period., `performanceSegmentationType`* — Gets or sets the type of performance segmentation for filtering purposes. Possib
**Scope:** `tn.mads.performance:r`

### POST /tenant/{tenant}/web-booking-attributions
Attributes a web booking to a web session.
**Body:** webSessionData, bookingId
**Scope:** `tn.mads.webbookingattributions:w`

### POST /tenant/{tenant}/web-lead-form-attributions
Attributes a web lead form to a web session.
**Body:** webSessionData, leadId
**Scope:** `tn.mads.webleadformattributions:w`

---

## Marketing Reputation
**Base:** `https://api.servicetitan.io/marketingreputation/v2`
**File:** `tenant-marketing-reputation-v2.json`

### GET /tenant/{tenant}/reviews
reviews
**Params:** `search`, `reportType`, `sort`, `createdOnOrAfter`, `createdBefore`, `modifiedOnOrAfter`, `modifiedBefore`, `fromDate`, `toDate`, `responseTypes`, `locationIds`, `sources`, `reviewStatuses`, `technicianIds`, `campaignIds`, `fromRating`, `toRating`, `includeReviewsWithoutLocation`, `includeReviewsWithoutCampaign`, `includeReviewsWithoutTechnician`, `internalId`, `externalId`
**Scope:** `tn.mrep.reviews:r`

---

## Marketing
**Base:** `https://api.servicetitan.io/marketing/v2`
**File:** `tenant-marketing-v2.json`

### GET /tenant/{tenant}/campaign-cost-summary
CampaignCostSummary_Get
**Params:** `from`*, `to`*
**Scope:** `tn.mrk.campaigncostsummary:r`

### GET /tenant/{tenant}/campaigns
Gets a paginated list of campaigns
**Params:** `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `active` — What kind of items should be returned (only active items will be returned by def, `ids` — Perform lookup by multiple IDs (maximum 50), `name` — Filters records by name (case-insensitive "contains" operation), `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `campaignPhoneNumber` — Filters campaigns by phone number (as string)., `sort` — Applies sorting by the specified field:\
**Scope:** `tn.mrk.campaigns:r`

### POST /tenant/{tenant}/campaigns
Creates new campaign
**Body:** name, businessUnitId, dnis, categoryId, active, isDefaultCampaign, source, medium
**Scope:** `tn.mrk.campaigns:w`

### GET /tenant/{tenant}/campaigns/{id}
Gets campaign specified by ID
**Scope:** `tn.mrk.campaigns:r`

### PATCH /tenant/{tenant}/campaigns/{id}
Updates specified campaign in "patch" mode
**Body:** name, businessUnitId, dnis, categoryId, active, isDefaultCampaign, source, medium
**Scope:** `tn.mrk.campaigns:w`

### GET /tenant/{tenant}/campaigns/{id}/costs
Gets a paginated list of campaign costs
**Params:** `year`, `month`, `sort` — Applies sorting by the specified field:\
**Scope:** `tn.mrk.campaigns:r`

### GET /tenant/{tenant}/categories
Gets a paginated list of campaign categories
**Params:** `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by the specified field:\
**Scope:** `tn.mrk.categories:r`

### POST /tenant/{tenant}/categories
Creates new campaign category
**Body:** name
**Scope:** `tn.mrk.categories:w`

### GET /tenant/{tenant}/categories/{id}
Gets campaign category specified by ID
**Scope:** `tn.mrk.categories:r`

### PATCH /tenant/{tenant}/categories/{id}
Updates specified campaign category in "patch" mode
**Body:** name, active
**Scope:** `tn.mrk.categories:w`

### GET /tenant/{tenant}/costs
Gets a paginated list of campaign costs
**Params:** `year` — Year, `month` — Month, `campaignId` — Campaign ID, `sort` — Applies sorting by the specified field:\
**Scope:** `tn.mrk.costs:r`

### POST /tenant/{tenant}/costs
Creates new campaign cost
**Body:** campaignId, year, month, dailyCost
**Scope:** `tn.mrk.costs:w`

### GET /tenant/{tenant}/costs/{id}
Gets campaign cost specified by ID
**Scope:** `tn.mrk.costs:r`

### PATCH /tenant/{tenant}/costs/{id}
Updates specified campaign cost in "patch" mode
**Body:** dailyCost
**Scope:** `tn.mrk.costs:w`

### ⭐ GET /tenant/{tenant}/email-channel-cost
EmailChannelCost_Get
**Params:** `from`*, `to`*
**Scope:** `tn.mrk.emailchannelcost:r`

---

## Memberships
**Base:** `https://api.servicetitan.io/memberships/v2`
**File:** `tenant-memberships-v2.json`

### ⭐ GET /tenant/{tenant}/export/invoice-templates
Provides export feed for invoice templates
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.mem.invoicetemplates:r`

### GET /tenant/{tenant}/export/membership-status-changes
Provides export feed for customer membership status changes
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.mem.memberships:r`

### GET /tenant/{tenant}/export/membership-types
Provides export feed for membership types
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.mem.membershiptypes:r`

### GET /tenant/{tenant}/export/memberships
Provides export feed for customer memberships
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.mem.memberships:r`

### GET /tenant/{tenant}/export/recurring-service-events
Provides export feed for recurring service events
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.mem.recurringserviceevents:r`

### GET /tenant/{tenant}/export/recurring-service-types
Provides export feed for recurring service types
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.mem.recurringservicetypes:r`

### GET /tenant/{tenant}/export/recurring-services
Provides export feed for recurring services
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.mem.recurringservices:r`

### ⭐ GET /tenant/{tenant}/invoice-templates
Gets a list of invoice templates by given IDs
**Params:** `ids`* — Perform lookup by multiple IDs (maximum 50)
**Scope:** `tn.mem.invoicetemplates:r`

### ⭐ POST /tenant/{tenant}/invoice-templates
Creates new invoice template
**Body:** items
**Scope:** `tn.mem.invoicetemplates:w`

### ⭐ GET /tenant/{tenant}/invoice-templates/{id}
Gets invoice template specified by ID
**Scope:** `tn.mem.invoicetemplates:r`

### ⭐ PATCH /tenant/{tenant}/invoice-templates/{id}
Updates specified invoice template in "patch" mode
**Body:** name, createdOn, createdById, active, items
**Scope:** `tn.mem.invoicetemplates:w`

### GET /tenant/{tenant}/membership-types
Gets a list of membership types
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `active` — What kind of items should be returned (only active items will be returned by def, `duration` — Filters by membership duration (in months); use null for ongoing memberships, `billingFrequency` — Filters by membership billing frequency\, `includeDurationBilling` — Whether duration/billing should be included in the result, `includeDiscounts` — Whether discounts should be included in the result, `includeRecurringServices` — Whether recurring service types associated with the membership type should be in, `includeTags` — Whether tag type IDs associated with the membership type should be included in t, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by specified fields
**Scope:** `tn.mem.membershiptypes:r`

### GET /tenant/{tenant}/membership-types/{id}
Gets membership type specified by ID
**Scope:** `tn.mem.membershiptypes:r`

### GET /tenant/{tenant}/membership-types/{id}/discounts
Gets discounts for the given membership type
**Scope:** `tn.mem.membershiptypes:r`

### GET /tenant/{tenant}/membership-types/{id}/duration-billing-items
Gets duration/billing options for the given membership type
**Params:** `active` — What kind of items should be returned (only active items will be returned by def
**Scope:** `tn.mem.membershiptypes:r`

### GET /tenant/{tenant}/membership-types/{id}/recurring-service-items
Gets recurring services for the given membership type
**Scope:** `tn.mem.membershiptypes:r`

### GET /tenant/{tenant}/memberships
Gets a list of customer memberships
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `customerIds` — Filters by customer IDs, `status` — Filters by membership status\, `duration` — Filters by membership duration (in months); use null for ongoing memberships, `billingFrequency` — Filters by membership billing frequency\, `active` — What kind of items should be returned (only active items will be returned by def, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by specified fields
**Scope:** `tn.mem.memberships:r`

### ⭐ GET /tenant/{tenant}/memberships/custom-fields
Gets a list of custom field types that apply to customer memberships
**Params:** `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by specified fields
**Scope:** `tn.mem.memberships:r`

### POST /tenant/{tenant}/memberships/sale
Creates membership sale invoice
**Body:** customerId, businessUnitId, saleTaskId, durationBillingId, locationId, recurringServiceAction, recurringLocationId
**Scope:** `tn.mem.memberships:w`

### GET /tenant/{tenant}/memberships/{id}
Gets customer membership specified by ID
**Scope:** `tn.mem.memberships:r`

### PATCH /tenant/{tenant}/memberships/{id}
Updates specified customer membership in "patch" mode
**Body:** businessUnitId, nextScheduledBillDate, status, memo, from, to, soldById, billingTemplateId
**Scope:** `tn.mem.memberships:w`

### GET /tenant/{tenant}/memberships/{id}/status-changes
Gets status changes for the given customer membership
**Scope:** `tn.mem.memberships:r`

### GET /tenant/{tenant}/recurring-service-events
Gets a list of recurring service events
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `locationId` — Location ID , `jobId` — Job ID , `status` — Follow up status \, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort`
**Scope:** `tn.mem.recurringserviceevents:r`

### POST /tenant/{tenant}/recurring-service-events/{id}/mark-complete
Marks the specified recurring service event as complete
**Body:** jobId
**Scope:** `tn.mem.recurringserviceevents:w`

### POST /tenant/{tenant}/recurring-service-events/{id}/mark-incomplete
Marks the specified recurring service event as incomplete
**Body:** jobId
**Scope:** `tn.mem.recurringserviceevents:w`

### GET /tenant/{tenant}/recurring-service-types
Gets a list of recurring service types
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `membershipTypeId` — Filters by membership type ID, `recurrenceType` — Filters by recurrence type\, `durationType` — Filters by duration type\, `active` — What kind of items should be returned (only active items will be returned by def, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by the specified field:\
**Scope:** `tn.mem.recurringservicetypes:r`

### GET /tenant/{tenant}/recurring-service-types/{id}
Gets recurring service type specified by ID
**Scope:** `tn.mem.recurringservicetypes:r`

### GET /tenant/{tenant}/recurring-services
Gets a list of recurring services
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `membershipIds` — Filters by customer membership IDs, `locationIds` — Filters by location IDs, `active` — What kind of items should be returned (only active items will be returned by def, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `includeTechnicians` — Whether technician IDs should be included in the result., `sort` — Applies sorting by specified fields
**Scope:** `tn.mem.recurringservices:r`

### GET /tenant/{tenant}/recurring-services/{id}
Gets recurring service specified by ID
**Scope:** `tn.mem.recurringservices:r`

### PATCH /tenant/{tenant}/recurring-services/{id}
Updates specified recurring service in "patch" mode
**Body:** name, active, recurringServiceTypeId, durationType, durationLength, from, memo, invoiceTemplateId
**Scope:** `tn.mem.recurringservices:w`

---

## Payroll
**Base:** `https://api.servicetitan.io/payroll/v2`
**File:** `tenant-payroll-v2.json`

### GET /tenant/{tenant}/activity-codes
Gets a list of payroll activity codes
**Params:** `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `active` — What kind of items should be returned (only active items will be returned by def, `sort` — Applies sorting by specified fields
**Scope:** `tn.prl.activitycodes:r`

### GET /tenant/{tenant}/activity-codes/{id}
Gets payroll activity code specified by ID
**Scope:** `tn.prl.activitycodes:r`

### GET /tenant/{tenant}/employees/{employee}/payroll-settings
Gets the employee payroll settings
**Scope:** `tn.prl.payrollsettings:r`

### PUT /tenant/{tenant}/employees/{employee}/payroll-settings
Updates the employee payroll settings
**Body:** externalPayrollId, hourlyRate, managerId, payrollBusinessUnitId, hireDate, isIncludedInPayroll, customFields
**Scope:** `tn.prl.payrollsettings:w`

### GET /tenant/{tenant}/employees/{employee}/payrolls
Gets a list of employee payrolls
**Params:** `startedOnOrAfter` — Return items having start date after certain date/time (in UTC), `endedOnOrBefore` — Return items having end date before certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `approvedOnOrAfter` — Return items approved on or after certain date/time (in UTC), `status` — Return items of the specified payroll status\, `active` — What kind of items should be returned (only active items will be returned by def, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `sort` — Applies sorting by specified fields
**Scope:** `tn.prl.employees:r`

### GET /tenant/{tenant}/export/activity-codes
Provides export feed for activity codes
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.prl.activitycodes:r`

### GET /tenant/{tenant}/export/gross-pay-items
Provides export feed for gross pay items
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.prl.grosspayitems:r`

### ⭐ GET /tenant/{tenant}/export/jobs/splits
Provides export feed for job splits
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.prl.jobs:r`

### ⭐ GET /tenant/{tenant}/export/jobs/timesheets
Provides export feed for job timesheets
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.prl.jobs:r`

### GET /tenant/{tenant}/export/payroll-adjustments
Provides export feed for payroll adjustments
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.prl.payrolladjustments:r`

### GET /tenant/{tenant}/export/payroll-settings
Provides export feed for payroll settings
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.prl.payrollsettings:r`

### GET /tenant/{tenant}/export/timesheet-codes
Provides export feed for timesheet codes
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.prl.timesheetcodes:r`

### POST /tenant/{tenant}/gross-pay-items
Creates new gross pay item
**Body:** payrollId, amount, activityCodeId, date, invoiceId, budgetCodeId, memo
**Scope:** `tn.prl.grosspayitems:w`

### GET /tenant/{tenant}/gross-pay-items
Gets a list of gross pay items
**Params:** `employeeType` — The type of employee\, `employeeId` — The Employee ID, `payrollIds` — The payroll ID, `dateOnOrAfter` — Return items having date after certain date/time (in UTC), `dateOnOrBefore` — Return items having date before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `createdBefore` — Return items created before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `modifiedOnOrBefore` — Return items modified on or before certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `sort` — Applies sorting by specified fields
**Scope:** `tn.prl.grosspayitems:r`

### PUT /tenant/{tenant}/gross-pay-items/{id}
Update specified gross pay item
**Body:** payrollId, amount, activityCodeId, date, invoiceId, budgetCodeId, memo
**Scope:** `tn.prl.grosspayitems:w`

### DELETE /tenant/{tenant}/gross-pay-items/{id}
Delete specified gross pay item
**Scope:** `tn.prl.grosspayitems:w`

### ⭐ GET /tenant/{tenant}/jobs/splits
Gets a list of job splits by multiple jobs
**Params:** `jobIds`, `createdOnOrAfter` — Returns job split created on or after a certain date/time (in UTC), `createdBefore` — Return job splits created before a certain date/time (in UTC), `modifiedOnOrAfter` — Returns job split modified on or after a certain date/time (in UTC), `modifiedBefore` — Returns job split modified before a certain date/time (in UTC), `active` — Returns job split by active status\, `sort` — Applies sorting by the specified field:\
**Scope:** `tn.prl.jobs:r`

### ⭐ GET /tenant/{tenant}/jobs/timesheets
Gets a list of job timesheets by multiple jobs
**Params:** `jobIds`, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `active` — What kind of items should be returned (only active items will be returned by def, `technicianId` — The technician ID, `startedOn` — Return items having dispatch, arrive, cancel or done dates after certain date/ti, `endedOn` — Return items having dispatch, arrive, cancel or done dates before certain date/t, `sort` — Applies sorting by the specified field:\
**Scope:** `tn.prl.jobs:r`

### ⭐ GET /tenant/{tenant}/jobs/{job}/splits
Gets a list of job splits
**Params:** `createdOnOrAfter` — Returns job split created on or after a certain date/time (in UTC), `createdBefore` — Return job splits created before a certain date/time (in UTC), `modifiedOnOrAfter` — Returns job split modified on or after a certain date/time (in UTC), `modifiedBefore` — Returns job split modified before a certain date/time (in UTC), `active` — Returns job split by active status\, `sort` — Applies sorting by the specified field:\
**Scope:** `tn.prl.jobs:r`

### ⭐ GET /tenant/{tenant}/jobs/{job}/timesheets
Gets a list of job timesheets
**Params:** `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `active` — What kind of items should be returned (only active items will be returned by def, `technicianId` — The technician ID, `startedOn` — Return items having dispatch, arrive, cancel or done dates after certain date/ti, `endedOn` — Return items having dispatch, arrive, cancel or done dates before certain date/t, `sort` — Applies sorting by the specified field:\
**Scope:** `tn.prl.jobs:r`

### GET /tenant/{tenant}/locations/rates
Gets a list of location hourly rates by multiple locations
**Params:** `locationIds` — Returns location rates for the specified location IDs, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `active` — What kind of items should be returned (only active items will be returned by def, `sort` — Applies sorting by the specified field:\
**Scope:** `tn.prl.locations:r`

### ⭐ GET /tenant/{tenant}/non-job-timesheets
Gets a list of non job timesheets for employee
**Params:** `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `employeeId` — The employee ID, `employeeType` — The employee type\, `active` — What kind of items should be returned (only active items will be returned by def, `sort` — Applies sorting by the specified field:\
**Scope:** `tn.prl.nonjobtimesheets:r`

### POST /tenant/{tenant}/payroll-adjustments
Creates new payroll adjustment
**Body:** employeeType, employeeId, postedOn, amount, memo, activityCodeId, invoiceId, hours
**Scope:** `tn.prl.payrolladjustments:w`

### GET /tenant/{tenant}/payroll-adjustments
Gets a list of payroll adjustments
**Params:** `employeeIds` — The comma separated list of employee IDs, `postedOnOrAfter` — Return payroll adjustments posted on or after certain date/time (in UTC), `postedOnOrBefore` — Return payroll adjustments posted on or before certain date/time (in UTC), `active` — What kind of items should be returned (only active items will be returned by def, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by specified fields
**Scope:** `tn.prl.payrolladjustments:r`

### GET /tenant/{tenant}/payroll-adjustments/{id}
Gets payroll adjustment specified by ID
**Params:** `employeeType` — The employee type\
**Scope:** `tn.prl.payrolladjustments:r`

### GET /tenant/{tenant}/payroll-settings
Gets the payroll settings list
**Params:** `employeeType` — The type of employee\, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `active` — What kind of items should be returned (only active items will be returned by def
**Scope:** `tn.prl.payrollsettings:r`

### GET /tenant/{tenant}/payrolls
Gets a list of payrolls
**Params:** `employeeType` — The type of employee\, `startedOnOrAfter` — Return items having start date after certain date/time (in UTC), `endedOnOrBefore` — Return items having end date before certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `approvedOnOrAfter` — Return items approved on or after certain date/time (in UTC), `status` — Return items of the specified payroll status\, `active` — What kind of items should be returned (only active items will be returned by def, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `sort` — Applies sorting by specified fields
**Scope:** `tn.prl.payrolls:r`

### GET /tenant/{tenant}/technicians/{technician}/payroll-settings
Gets the technician payroll settings
**Scope:** `tn.prl.payrollsettings:r`

### PUT /tenant/{tenant}/technicians/{technician}/payroll-settings
Updates the technician payroll settings
**Body:** externalPayrollId, hourlyRate, managerId, payrollBusinessUnitId, hireDate, isIncludedInPayroll, customFields
**Scope:** `tn.prl.payrollsettings:w`

### GET /tenant/{tenant}/technicians/{technician}/payrolls
Gets a list of technician payrolls
**Params:** `startedOnOrAfter` — Return items having start date after certain date/time (in UTC), `endedOnOrBefore` — Return items having end date before certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `approvedOnOrAfter` — Return items approved on or after certain date/time (in UTC), `status` — Return items of the specified payroll status\, `active` — What kind of items should be returned (only active items will be returned by def, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `sort` — Applies sorting by specified fields
**Scope:** `tn.prl.technicians:r`

### GET /tenant/{tenant}/timesheet-codes
Gets a list of timesheet codes
**Params:** `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `active` — What kind of items should be returned (only active items will be returned by def, `sort` — Applies sorting by the specified field:\
**Scope:** `tn.prl.timesheetcodes:r`

### GET /tenant/{tenant}/timesheet-codes/{id}
Gets timesheet code specified by ID
**Scope:** `tn.prl.timesheetcodes:r`

---

## Pricebook
**Base:** `https://api.servicetitan.io/pricebook/v2`
**File:** `tenant-pricebook-v2.json`

### GET /tenant/{tenant}/categories
GET the categories in your pricebook
**Params:** `sort` — Applies sorting by the specified field:\, `categoryType` — Category type\, `active` — What kind of items should be returned (only active items will be returned by def, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC)
**Scope:** `tn.pb.categories:r`

### POST /tenant/{tenant}/categories
Post to add a new category to your pricebook
**Body:** name, active, description, parentId, position, image, categoryType, businessUnitIds
**Scope:** `tn.pb.categories:w`

### GET /tenant/{tenant}/categories/{id}
Gets category details
**Scope:** `tn.pb.categories:r`

### PATCH /tenant/{tenant}/categories/{id}
Edits an existing category in your pricebook
**Body:** name, active, description, parentId, position, image, categoryType, businessUnitIds
**Scope:** `tn.pb.categories:w`

### DELETE /tenant/{tenant}/categories/{id}
Deletes an existing category from your pricebook
**Scope:** `tn.pb.categories:w`

### GET /tenant/{tenant}/clientspecificpricing
ClientSpecificPricing_GetAllRateSheets
**Params:** `ids`, `searchTerm`, `active` — Values: [True, Any, False]
**Scope:** `tn.pb.csp:r`

### PATCH /tenant/{tenant}/clientspecificpricing/{rateSheetId}
ClientSpecificPricing_UpdateRateSheet
**Body:** exceptions
**Scope:** `tn.pb.csp:w`

### GET /tenant/{tenant}/discounts-and-fees
Get data on all of the discounts or fees in the pricebook. Supports optional search filtering.
**Params:** `sort` — Applies sorting by the specified field:\, `ids` — Perform lookup by multiple IDs (maximum 50), `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `active` — What kind of items should be returned (only active items will be returned by def, `externalDataApplicationGuid` — Items that are created with a specific guid, could be fetched/updated/removed, `externalDataKey` — Allows filtering by external data key, `externalDataValues` — Allows filtering by external data values, `searchText` — Optional search text to filter by. Performs case-insensitive partial match on
**Scope:** `tn.pb.discountsandfees:r`

### POST /tenant/{tenant}/discounts-and-fees
Post to add a new discount or fee to your pricebook
**Body:** type, code, displayName, description, amountType, amount, limit, taxable
**Scope:** `tn.pb.discountsandfees:w`

### GET /tenant/{tenant}/discounts-and-fees/{id}
Get details of a discount or fee in the pricebook.
**Params:** `externalDataApplicationGuid` — Items that are created with a specific guid, could be fetched/updated/removed
**Scope:** `tn.pb.discountsandfees:r`

### PATCH /tenant/{tenant}/discounts-and-fees/{id}
Edit an existing item in your pricebook
**Body:** type, code, displayName, description, amountType, amount, intacctGlGroupAccount, limit
**Scope:** `tn.pb.discountsandfees:w`

### DELETE /tenant/{tenant}/discounts-and-fees/{id}
Deletes a discount or fee from your pricebook
**Scope:** `tn.pb.discountsandfees:w`

### GET /tenant/{tenant}/equipment
Get data on all the equipment in the pricebook. Supports optional search filtering.
**Params:** `sort` — Applies sorting by the specified field:\, `ids` — Perform lookup by multiple IDs (maximum 50), `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `active` — What kind of items should be returned (only active items will be returned by def, `externalDataApplicationGuid` — Items that are created with a specific guid, could be fetched/updated/removed, `externalDataKey` — Allows filtering by external data key, `externalDataValues` — Allows filtering by external data values, `searchText` — Optional search text to filter by. Performs case-insensitive partial match on
**Scope:** `tn.pb.equipment:r`

### POST /tenant/{tenant}/equipment
Post to add new equipment to your pricebook
**Body:** equipmentMaterials, recommendations, upgrades, code, displayName, description, price, memberPrice
**Scope:** `tn.pb.equipment:w`

### GET /tenant/{tenant}/equipment/{id}
Get details of equipment in the pricebook.
**Params:** `externalDataApplicationGuid` — Items that are created with a specific guid, could be fetched/updated/removed
**Scope:** `tn.pb.equipment:r`

### PATCH /tenant/{tenant}/equipment/{id}
Edit an existing item in your pricebook
**Body:** code, displayName, description, price, memberPrice, addOnPrice, addOnMemberPrice, active
**Scope:** `tn.pb.equipment:w`

### DELETE /tenant/{tenant}/equipment/{id}
Deletes equipment from your pricebook
**Scope:** `tn.pb.equipment:w`

### GET /tenant/{tenant}/export/categories
Provides export feed for categories
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.pb.categories:r`

### GET /tenant/{tenant}/export/equipment
Provides export feed for equipment
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.pb.equipment:r`

### GET /tenant/{tenant}/export/materials
Provides export feed for materials
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.pb.materials:r`

### GET /tenant/{tenant}/export/services
Provides export feed for services
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.pb.services:r`

### GET /tenant/{tenant}/images
Downloads a specified pricebook image.
**Params:** `path` — The storage path of the pricebook image to retrieve, as returned by other priceb
**Scope:** `tn.pb.images:r`

### POST /tenant/{tenant}/images
Uploads a specified image to temporary storage.
To associate the image with a pricebook item, send a separate request to update that item.
**Body:** file
**Scope:** `tn.pb.images:w`

### GET /tenant/{tenant}/materials
Get details on materials in the pricebook. Supports optional search filtering.
**Params:** `isOtherDirectCost` — Allows filtering by Is Other Direct Cost, `costTypeIds` — Allows filtering by Cost Type Ids, `sort` — Applies sorting by the specified field:\, `ids` — Perform lookup by multiple IDs (maximum 50), `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `active` — What kind of items should be returned (only active items will be returned by def, `externalDataApplicationGuid` — Items that are created with a specific guid, could be fetched/updated/removed, `externalDataKey` — Allows filtering by external data key, `externalDataValues` — Allows filtering by external data values, `searchText` — Optional search text to filter by. Performs case-insensitive partial match on
**Scope:** `tn.pb.materials:r`

### POST /tenant/{tenant}/materials
Add a new Materials to your pricebook
**Body:** code, displayName, description, cost, active, price, memberPrice, addOnPrice
**Scope:** `tn.pb.materials:w`

### GET /tenant/{tenant}/materials/costtypes
Get details on materials in the pricebook.
**Scope:** `tn.pb.materials:r`

### GET /tenant/{tenant}/materials/{id}
Get details on a material in the pricebook.
**Params:** `externalDataApplicationGuid` — Items that are created with a specific guid, could be fetched/updated/removed
**Scope:** `tn.pb.materials:r`

### PATCH /tenant/{tenant}/materials/{id}
Edit an existing item in your pricebook
**Body:** code, displayName, description, cost, active, price, memberPrice, addOnPrice
**Scope:** `tn.pb.materials:w`

### DELETE /tenant/{tenant}/materials/{id}
Deletes a material from your pricebook
**Scope:** `tn.pb.materials:w`

### GET /tenant/{tenant}/materialsmarkup
Get materials markup collection
**Scope:** `tn.pb.materials:r`

### POST /tenant/{tenant}/materialsmarkup
Create materials markup item
**Body:** id, from, to, percent
**Scope:** `tn.pb.materials:w`

### GET /tenant/{tenant}/materialsmarkup/{id}
Get materials markup item
**Scope:** `tn.pb.materials:r`

### PUT /tenant/{tenant}/materialsmarkup/{id}
Update materials markup item
**Body:** id, from, to, percent
**Scope:** `tn.pb.materials:w`

### POST /tenant/{tenant}/pricebook
PricebookBulk_Create
**Body:** services, equipment, materials, discountAndFees
**Scope:** `tn.pb.pricebook:w`

### PATCH /tenant/{tenant}/pricebook
PricebookBulk_Update
**Body:** services, equipment, materials, discountAndFees
**Scope:** `tn.pb.pricebook:w`

### GET /tenant/{tenant}/services
Get data on all of the services in the pricebook. Supports optional search filtering.
**Params:** `calculatePrices` — If true, the prices will be calculated based on the current dynamic pricing rule, `sort` — Applies sorting by the specified field:\, `ids` — Perform lookup by multiple IDs (maximum 50), `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `active` — What kind of items should be returned (only active items will be returned by def, `externalDataApplicationGuid` — Items that are created with a specific guid, could be fetched/updated/removed, `externalDataKey` — Allows filtering by external data key, `externalDataValues` — Allows filtering by external data values, `searchText` — Optional search text to filter by. Performs case-insensitive partial match on
**Scope:** `tn.pb.services:r`

### POST /tenant/{tenant}/services
Post to add a new service to your pricebook
**Body:** serviceMaterials, serviceEquipment, recommendations, upgrades, code, displayName, description, warranty
**Scope:** `tn.pb.services:w`

### GET /tenant/{tenant}/services/{id}
Get details a service in the pricebook.
**Params:** `calculatePrices` — If true, the prices will be calculated based on the current dynamic pricing rule, `externalDataApplicationGuid` — Items that are created with a specific guid, could be fetched/updated/removed
**Scope:** `tn.pb.services:r`

### PATCH /tenant/{tenant}/services/{id}
Edit an existing item in your pricebook
**Body:** code, displayName, description, warranty, categories, price, memberPrice, addOnPrice
**Scope:** `tn.pb.services:w`

### DELETE /tenant/{tenant}/services/{id}
Deletes a service from your pricebook
**Scope:** `tn.pb.services:w`

---

## Reporting
**Base:** `https://api.servicetitan.io/reporting/v2`
**File:** `tenant-reporting-v2.json`

### GET /tenant/{tenant}/dynamic-value-sets/{dynamicSetId}
List values of given dynamic set including key and display name
**Scope:** `tn.rpr.dynamicvaluesets:r`

### GET /tenant/{tenant}/report-categories
List categories for existing  reports
**Scope:** `tn.rpr.reportcategories:r`

### GET /tenant/{tenant}/report-category/{report_category}/reports
List reports within given category
**Scope:** `tn.rpr.reports:r`

### GET /tenant/{tenant}/report-category/{report_category}/reports/{reportId}
Get report description including input parameters and output fields etc.
Take a note that the report description isn't fixed and may be changed by the report owner.
**Scope:** `tn.rpr.reports:r`

### POST /tenant/{tenant}/report-category/{report_category}/reports/{reportId}/data
Get report data. The result is based on current report description which isn't constant in general.
Beware that report columns may be changed. Result field names are listed alongside the data in the response
to validate that all the requested columns are there.
**Body:** parameters
**Scope:** `tn.rpr.reports:r`

---

## Sales & Estimates
**Base:** `https://api.servicetitan.io/sales/v2`
**File:** `tenant-salestech-v2.json`

### ⭐ GET /tenant/{tenant}/estimate-templates
Gets a paginated list of estimate templates.
**Params:** `active` — Values: [True, Any, False], `modifiedBefore`, `modifiedOnOrAfter`
**Scope:** `tn.sal.estimatetemplates:r`

### ⭐ POST /tenant/{tenant}/estimate-templates
Creates a new estimate template.
**Body:** name, internalName, summary, mode, active, businessUnitId, items
**Scope:** `tn.sal.estimatetemplates:w`

### ⭐ GET /tenant/{tenant}/estimate-templates/{id}
Gets a single estimate template by ID.
**Scope:** `tn.sal.estimatetemplates:r`

### ⭐ PATCH /tenant/{tenant}/estimate-templates/{id}
Updates an existing estimate template.
**Body:** name, internalName, summary, mode, active, businessUnitId, items
**Scope:** `tn.sal.estimatetemplates:w`

### ⭐ DELETE /tenant/{tenant}/estimate-templates/{id}
Deactivates an estimate template.
**Scope:** `tn.sal.estimatetemplates:w`

### ⭐ GET /tenant/{tenant}/estimates
Estimates_GetList
**Params:** `jobId`, `projectId`, `jobNumber`, `totalGreater`, `totalLess`, `soldById`, `soldByEmployeeId`, `ids` — Perform lookup by multiple IDs (maximum 50), `soldAfter`, `soldBefore`, `status`, `active` — What kind of items should be returned (only active items will be returned by def, `sort` — Applies sorting by specified fields, `orderBy` — Deprecated: Use Sort parameter instead. Field to sort by (Id, CreatedOn, Modifie, `orderByDirection` — Deprecated: Use Sort parameter instead. Sort direction (asc/desc)., `createdBefore`, `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `locationId`
**Scope:** `tn.sal.estimates:r`

### ⭐ POST /tenant/{tenant}/estimates
Estimates_Create
**Body:** name, summary, tax, status, reviewStatus, soldBy, isRecommended, budgetCodeId
**Scope:** `tn.sal.estimates:w`

### ⭐ GET /tenant/{tenant}/estimates/export
Provides export feed for estimates (legacy endpoint)
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.sal.estimates:r`

### ⭐ GET /tenant/{tenant}/estimates/items
Estimates_GetItems
**Params:** `estimateId`, `ids` — Perform lookup by multiple IDs (maximum 50), `active` — What kind of items should be returned (only active items will be returned by def, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by specified fields
**Scope:** `tn.sal.estimates:r`

### ⭐ GET /tenant/{tenant}/estimates/{id}
Estimates_Get
**Scope:** `tn.sal.estimates:r`

### ⭐ PUT /tenant/{tenant}/estimates/{id}
Estimates_Update
**Body:** name, summary, tax, status, reviewStatus, soldBy, isRecommended, budgetCodeId
**Scope:** `tn.sal.estimates:w`

### ⭐ PUT /tenant/{tenant}/estimates/{id}/dismiss
Estimates_Dismiss
**Scope:** `tn.sal.estimates:w`

### ⭐ PUT /tenant/{tenant}/estimates/{id}/items
Estimates_PutItem
**Body:** id, skuId, skuName, parentItemId, description, isAddOn, quantity, unitPrice
**Scope:** `tn.sal.estimates:w`

### ⭐ DELETE /tenant/{tenant}/estimates/{id}/items/{itemId}
Estimates_DeleteItem
**Scope:** `tn.sal.estimates:w`

### ⭐ PUT /tenant/{tenant}/estimates/{id}/sell
Estimates_Sell
**Body:** soldBy
**Scope:** `tn.sal.estimates:w`

### ⭐ PUT /tenant/{tenant}/estimates/{id}/unsell
Estimates_Unsell
**Scope:** `tn.sal.estimates:w`

### ⭐ GET /tenant/{tenant}/export/estimates
Provides export feed for estimates
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.sal.estimates:r`

### GET /tenant/{tenant}/proposal-templates
Gets a list of proposal templates.
**Params:** `active` — Values: [True, Any, False], `proposalTypeId` — Filter by proposal type. Obtain proposal type IDs from GET /proposal-types., `modifiedBefore`, `modifiedOnOrAfter`
**Scope:** `tn.sal.proposaltemplates:r`

### POST /tenant/{tenant}/proposal-templates
Creates a new proposal template.
**Body:** name, description, proposalTypeId, status, active, businessUnitIds, estimateAssignments
**Scope:** `tn.sal.proposaltemplates:w`

### GET /tenant/{tenant}/proposal-templates/{id}
Gets a single proposal template by ID.
**Scope:** `tn.sal.proposaltemplates:r`

### PATCH /tenant/{tenant}/proposal-templates/{id}
Updates an existing proposal template. Only provided fields are changed; omitted fields are left unchanged.
**Body:** name, description, proposalTypeId, status, active, businessUnitIds, estimateAssignments
**Scope:** `tn.sal.proposaltemplates:w`

### DELETE /tenant/{tenant}/proposal-templates/{id}
Deactivates a proposal template. The template is not deleted and can be reactivated via PATCH.
**Scope:** `tn.sal.proposaltemplates:w`

### GET /tenant/{tenant}/proposal-types
ProposalTypes_Get
**Params:** `active` — Values: [True, Any, False]
**Scope:** `tn.sal.proposaltypes:r`

### ⭐ GET /tenant/{tenant}/status/estimates/{id}/changes
Get estimate status change details along with UTC timestamp.
**Scope:** `tn.sal.estimates:r`

---

## Scheduling Pro
**Base:** `https://api.servicetitan.io/schedulingpro/v2`
**File:** `tenant-scheduling-pro-v2 (1).json`

### GET /tenant/{tenant}/routers/{id}/performance
Provides performance data for router
**Params:** `sessionCreatedOnOrAfter`*, `sessionCreatedBefore`*
**Scope:** `tn.sp.schedulers:r`

### GET /tenant/{tenant}/routers/{id}/sessions
Gets a paginated list of sessions for router
**Params:** `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC)
**Scope:** `tn.sp.schedulers:r`

### GET /tenant/{tenant}/schedulers
Gets a list of schedulers
**Params:** `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC)
**Scope:** `tn.sp.schedulers:r`

### GET /tenant/{tenant}/schedulers/{id}/performance
Provides performance data for scheduler
**Params:** `sessionCreatedOnOrAfter`*, `sessionCreatedBefore`*
**Scope:** `tn.sp.schedulers:r`

### GET /tenant/{tenant}/schedulers/{id}/sessions
Gets a paginated list of sessions for scheduler
**Params:** `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC)
**Scope:** `tn.sp.schedulers:r`

---

## Scheduling Pro
**Base:** `https://api.servicetitan.io/schedulingpro/v2`
**File:** `tenant-scheduling-pro-v2.json`

### GET /tenant/{tenant}/routers/{id}/performance
Provides performance data for router
**Params:** `sessionCreatedOnOrAfter`*, `sessionCreatedBefore`*
**Scope:** `tn.sp.schedulers:r`

### GET /tenant/{tenant}/routers/{id}/sessions
Gets a paginated list of sessions for router
**Params:** `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC)
**Scope:** `tn.sp.schedulers:r`

### GET /tenant/{tenant}/schedulers
Gets a list of schedulers
**Params:** `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC)
**Scope:** `tn.sp.schedulers:r`

### GET /tenant/{tenant}/schedulers/{id}/performance
Provides performance data for scheduler
**Params:** `sessionCreatedOnOrAfter`*, `sessionCreatedBefore`*
**Scope:** `tn.sp.schedulers:r`

### GET /tenant/{tenant}/schedulers/{id}/sessions
Gets a paginated list of sessions for scheduler
**Params:** `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC)
**Scope:** `tn.sp.schedulers:r`

---

## Service Agreements
**Base:** `https://api.servicetitan.io/service-agreements/v2`
**File:** `tenant-service-agreements-v2.json`

### GET /tenant/{tenant}/export/service-agreements
Provides export feed for service agreements
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.sa.serviceagreements:r`

### GET /tenant/{tenant}/service-agreements
Gets a list of service agreements
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `customerIds` — Filters by customer IDs, `businessUnitIds` — Filters by business unit IDs, `status` — Filters by service agreement status\, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `sort` — Applies sorting by the specified field:\
**Scope:** `tn.sa.serviceagreements:r`

### GET /tenant/{tenant}/service-agreements/{id}
Gets service agreement specified by ID
**Scope:** `tn.sa.serviceagreements:r`

---

## Settings
**Base:** `https://api.servicetitan.io/settings/v2`
**File:** `tenant-settings-v2.json`

### GET /tenant/{tenant}/business-units
Gets a list of business units
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `name` — Filters records by name (case-insensitive "contains" operation), `active` — What kind of items should be returned (only active items will be returned by def, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `externalDataApplicationGuid` — If this guid is provided, external data corresponding to
**Scope:** `tn.stt.businessunits:r`

### GET /tenant/{tenant}/business-units/intacct
Retrieves a paginated list of Intacct business unit mappings based on the specified query parameters.
**Params:** `ids`
**Scope:** `tn.stt.businessunits:r`

### GET /tenant/{tenant}/business-units/{id}
Gets a business unit by ID
**Params:** `externalDataApplicationGuid`
**Scope:** `tn.stt.businessunits:r`

### PATCH /tenant/{tenant}/business-units/{id}
Update an existing BusinessUnit
**Body:** externalData
**Scope:** `tn.stt.businessunits:w`

### GET /tenant/{tenant}/employees
Gets a list of employees
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `userIds` — Perform lookup by multiple User Ids (maximum 50), `name` — Filters records by name (case-insensitive "contains" operation), `email` — Filters records by email (exact match)., `active` — What kind of items should be returned (only active items will be returned by def, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC)
**Scope:** `tn.stt.employees:r`

### POST /tenant/{tenant}/employees
Creates new employee
**Body:** name, mobilePhoneNumber, phoneNumber, email, login, password, accountCreationMethod, businessUnitId
**Scope:** `tn.stt.employees:w`

### GET /tenant/{tenant}/employees/{id}
Gets a employee by ID
**Scope:** `tn.stt.employees:r`

### PATCH /tenant/{tenant}/employees/{id}
Updates employee
**Body:** name, mobilePhoneNumber, phoneNumber, email, login, businessUnitId, roleId, positions
**Scope:** `tn.stt.employees:w`

### POST /tenant/{tenant}/employees/{id}/account-actions
Performs standard actions with the account
**Body:** action
**Scope:** `tn.stt.employees:w`

### GET /tenant/{tenant}/export/business-units
Provides export feed for business units
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.stt.businessunits:r`

### GET /tenant/{tenant}/export/employees
Provides export feed for employees
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.stt.employees:r`

### GET /tenant/{tenant}/export/tag-types
Provides export feed for tag types
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.stt.tagtypes:r`

### GET /tenant/{tenant}/export/technicians
Provides export feed for technicians
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.stt.technicians:r`

### GET /tenant/{tenant}/tag-types
Gets a list of tag types
**Params:** `active` — What kind of items should be returned (only active items will be returned by def, `createdBefore`, `createdOnOrAfter`, `modifiedBefore`, `modifiedOnOrAfter`, `sort`
**Scope:** `tn.stt.tagtypes:r`

### POST /tenant/{tenant}/tag-types
Creates a tag type
**Body:** name, color, code, importance, isConversionOpportunity, allowToUseOnTimesheetActivity, isVisibleOnDispatchBoard
**Scope:** `tn.stt.tagtypes:w`

### PATCH /tenant/{tenant}/tag-types/{id}
Updates a tag type
**Body:** name, color, code, importance, isConversionOpportunity, allowToUseOnTimesheetActivity, isVisibleOnDispatchBoard
**Scope:** `tn.stt.tagtypes:w`

### GET /tenant/{tenant}/technicians
Gets a list of technicians
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `userIds` — Perform lookup by multiple User Ids (maximum 50), `name` — Filters records by name (case-insensitive "contains" operation), `active` — What kind of items should be returned (only active items will be returned by def, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC)
**Scope:** `tn.stt.technicians:r`

### POST /tenant/{tenant}/technicians
Creates new technician
**Body:** name, phoneNumber, email, login, password, accountCreationMethod, businessUnitId, roleId
**Scope:** `tn.stt.technicians:w`

### GET /tenant/{tenant}/technicians/{id}
Gets a technician by ID
**Scope:** `tn.stt.technicians:r`

### PATCH /tenant/{tenant}/technicians/{id}
Updates technician
**Body:** name, phoneNumber, email, login, businessUnitId, roleId, positions, aadUserId
**Scope:** `tn.stt.technicians:w`

### POST /tenant/{tenant}/technicians/{id}/account-actions
Performs standard actions with the account
**Body:** action, licenseType, truckId
**Scope:** `tn.stt.technicians:w`

### GET /tenant/{tenant}/user-roles
Gets a list of user roles
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `name` — Filters records by name (case-insensitive "contains" operation), `active` — What kind of items should be returned (only active items will be returned by def, `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `employeeType` — Filter roles by employee type\
**Scope:** `tn.stt.userroles:r`

---

## Task Management
**Base:** `https://api.servicetitan.io/taskmanagement/v2`
**File:** `tenant-task-management-v2.json`

### GET /tenant/{tenant}/data
ClientSideData_Get
**Scope:** `tn.tsm.data:r`

### GET /tenant/{tenant}/tasks
Get a list of tasks
**Params:** `active` — Values: [True, Any, False], `createdBefore` — Created date before, `createdOnOrAfter` — Created date on or after, `modifiedBefore` — Modified date before, `modifiedOnOrAfter` — Modified date on or after, `reportedBefore` — Reported date before, `reportedOnOrAfter` — Reported On or After, `completeBefore` — Completed Before, `completeOnOrAfter` — Completed On or After, `isClosed` — Is Closed, `statuses` — Task Status, `ids` — Task Ids (comma separated Ids), `name` — Name, `includeSubtasks` — Include Subtasks, `businessUnitIds` — Business Unit Ids (comma separated Ids), `employeeTaskTypeIds` — EmployeeTaskType Ids (comma separated Ids), `employeeTaskSourceIds` — EmployeeTaskSource Ids (comma separated Ids), `employeeTaskResolutionIds` — EmployeeTaskResolution Ids (comma separated Ids), `reportedById` — Reported By Id, `assignedToId` — Assigned to Id, `involvedEmployeeIdList` — Involved Employee Ids (comma separated Ids), `customerId` — Customer Id, `jobId` — Job Id, `projectId` — Project Id, `priorities` — Priorities (comma separated values), `taskNumber` — Task Number, `jobNumber` — Job Number, `sort` — Applies sorting by the specified field:\
**Scope:** `tn.tsm.tasks:r`

### POST /tenant/{tenant}/tasks
Tasks_Create
**Body:** reportedById, assignedToId, isClosed, status, name, businessUnitId, employeeTaskTypeId, employeeTaskSourceId
**Scope:** `tn.tsm.tasks:w`

### GET /tenant/{tenant}/tasks/{id}
Get a Task by Id
**Params:** `includeSubtasks`
**Scope:** `tn.tsm.tasks:r`

### POST /tenant/{tenant}/tasks/{id}/subtasks
Tasks_CreateSubtask
**Body:** isClosed, name, assignedToId, dueDateTime
**Scope:** `tn.tsm.tasks:w`

---

## Telecom
**Base:** `https://api.servicetitan.io/telecom`
**File:** `tenant-telecom.json`

### GET /v2/tenant/{tenant}/calls
Get filtered calls.
**Params:** `modifiedBefore` — Modified before a certain date/time (as date-time in RFC3339), not inclusive, `modifiedOnOrAfter` — Modified on or after a certain date/time (as date-time in RFC3339), inclusive, `createdOnOrAfter` — Created on or after a certain date/time (as date-time in RFC3339), inclusive, `modifiedAfter` — Modified after a certain date/time (as date-time in RFC3339), not inclusive, `minDuration` — Minimum call duration (number), `phoneNumberCalled` — The phone number that was called (string), `campaignId` — Campaign ID, `agentId` — Agent ID (number), `agentName` — Agent name (string), `agentIsExternal` — Is agent external flag (boolean), `agentExternalId` — Agent external ID (number), `orderBy` — Sorting (string with possible values "Id" (default), "createdOn", or "modifiedOn, `orderByDirection` — Sorting direction (string with possible values "asc" (default) or "desc"), `activeOnly`, `createdAfter`, `createdBefore`, `ids`
**Scope:** `tn.tlc.calls:r`

### GET /v2/tenant/{tenant}/calls/{id}
Get call's details.
**Scope:** `tn.tlc.calls:r`

### PUT /v2/tenant/{tenant}/calls/{id}
Update existing call.
**Body:** callId, callType, excuseMemo, campaignId, jobId, agentId, reason, customer
**Scope:** `tn.tlc.calls:w`

### GET /v2/tenant/{tenant}/calls/{id}/recording
Get recording of the call.
**Scope:** `tn.tlc.calls:r`

### ⭐ GET /v2/tenant/{tenant}/calls/{id}/voicemail
Get voicemail of the call.
**Scope:** `tn.tlc.calls:r`

### GET /v2/tenant/{tenant}/export/calls
Provides export feed for telecom calls
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.tlc.calls:r`

### GET /v3/tenant/{tenant}/calls
Provides a feed for telecom calls
**Params:** `ids` — Perform lookup by multiple IDs (maximum 50), `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `active` — What kind of items should be returned (only active items will be returned by def, `createdAfter` — Return items created after certain date/time (in UTC), `modifiedAfter` — Return items modified after certain date/time (in UTC), `campaignId` — Campaign ID, `agentId` — Agent ID (number), `minDuration` — Minimum call duration (number of seconds), `phoneNumberCalled` — The phone number that was called (string), `callerPhoneNumber` — The caller's phone number (string), `agentName` — Agent name (string), `agentIsExternal` — Is agent external flag (boolean), `agentExternalId` — Agent external ID (number), `sort` — The Sorting field, possible values: Id, CreatedOn, ModifiedOn., `sid` — Sid of the call (string), `tag` — Tag of the call (string)
**Scope:** `tn.tlc.calls:r`

---

## Timesheets
**Base:** `https://api.servicetitan.io/timesheets/v2`
**File:** `tenant-timesheets-v2.json`

### GET /tenant/{tenant}/activities
Gets a list of activities
**Params:** `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `active` — What kind of items should be returned (only active items will be returned by def, `sort` — Applies sorting by specified fields
**Scope:** `tn.tms.activities:r`

### POST /tenant/{tenant}/activities
Creates new activity
**Body:** employeeId, employeeType, activityTypeId, startTime, endTime, jobId, appointmentId, projectId
**Scope:** `tn.tms.activities:w`

### GET /tenant/{tenant}/activities/{id}
Gets activity specified by ID
**Scope:** `tn.tms.activities:r`

### PUT /tenant/{tenant}/activities/{id}
Updates the specified activity
**Body:** activityTypeId, startTime, endTime, jobId, appointmentId, projectId, projectLabel, laborTypeId
**Scope:** `tn.tms.activities:w`

### DELETE /tenant/{tenant}/activities/{id}
Deletes the specified activity
**Scope:** `tn.tms.activities:w`

### GET /tenant/{tenant}/activity-categories
Gets a list of activity categories
**Params:** `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `active` — What kind of items should be returned (only active items will be returned by def, `sort` — Applies sorting by the specified field:\
**Scope:** `tn.tms.activitycategories:r`

### GET /tenant/{tenant}/activity-categories/{id}
Gets activity category specified by ID
**Scope:** `tn.tms.activitycategories:r`

### GET /tenant/{tenant}/activity-types
Gets a list of activity types
**Params:** `createdBefore` — Return items created before certain date/time (in UTC), `createdOnOrAfter` — Return items created on or after certain date/time (in UTC), `modifiedBefore` — Return items modified before certain date/time (in UTC), `modifiedOnOrAfter` — Return items modified on or after certain date/time (in UTC), `active` — What kind of items should be returned (only active items will be returned by def, `sort` — Applies sorting by the specified field:\
**Scope:** `tn.tms.activitytypes:r`

### GET /tenant/{tenant}/activity-types/{id}
Gets activity types specified by ID
**Scope:** `tn.tms.activitytypes:r`

### GET /tenant/{tenant}/export/activities
Provides export feed for activity.
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.tms.activities:r`

### GET /tenant/{tenant}/export/activity-categories
Provides export feed for activity categories.
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.tms.activitycategories:r`

### GET /tenant/{tenant}/export/activity-types
Provides export feed for activity types.
**Params:** `from` — Continuation token received from previous export request in "continueFrom" field, `includeRecentChanges` — Use "true" to start receiving the most recent changes quicker.
**Scope:** `tn.tms.activitytypes:r`

---