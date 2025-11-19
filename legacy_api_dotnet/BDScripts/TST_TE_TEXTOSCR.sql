CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_ACCOUNTPAYMENTS_B1SLQuery" ( "DocEntry", "DocNum", "CardCode", "DocumentType", "Saldo", "DocTotal", "DocCurrency", "DocDate", "DocDateFilter", "TransId", "ObjType", "PayNoDoc", "OpenBal", "OpenBalFc" ) AS ((SELECT
            R."DocEntry",
            R."DocNum",
            R."CardCode",
            'Pagos' AS "DocumentType",
            (
                CASE
                    WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY(R."DocCurr") = 1 THEN R."OpenBal"
                    ELSE R."OpenBalFc"
                END
            ) AS "Saldo",
            R."DocTotal" AS "DocTotal",
            R."DocCurr" AS "DocCurrency",
            CLVS_D_MLT_SLT_DOCFULLDATE(R."DocTime", R."DocDate") AS "DocDate",
            CAST(R."DocDate" AS DATE) AS "DocDateFilter",
            R."TransId",
            R."ObjType",
            R."PayNoDoc",
            R."OpenBal",
            R."OpenBalFc"
        FROM
            "ORCT" AS R) UNION ALL (SELECT
            NC."DocEntry",
            NC."DocNum",
            NC."CardCode",
            'Nota de crédito' AS "DocumentType",
            (
                CASE
                    WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY(NC."DocCur") = 1 THEN COALESCE(NCInstallments."InsTotal" - NCInstallments."PaidToDate", 0)
                    ELSE COALESCE(NCInstallments."InsTotalFC" - NCInstallments."PaidFC", 0)
                END
            ) AS "Saldo",
            (
                CASE
                    WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY(NC."DocCur") = 1 THEN NCInstallments."InsTotal"
                    ELSE NCInstallments."InsTotalFC"
                END
            ) AS "DocTotal",
            NC."DocCur" AS "DocCurrency",
            CLVS_D_MLT_SLT_DOCFULLDATE(NC."DocTime", NC."DocDate") AS "DocDate",
            CAST(NC."DocDate" AS DATE) AS "DocDateFilter",
            NC."TransId",
            NC."ObjType",
            'Y' AS "PayNoDoc",
            1 AS "OpenBal",
            1 AS "OpenBalFc"
        FROM
            "ORIN" NC
        INNER JOIN
            "RIN6" NCInstallments
        ON
            NC."DocEntry" = NCInstallments."DocEntry"
        WHERE
            NC."DocStatus" = 'O')) WITH READ ONLY;



--0-----------------------------------------------------------0--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_ACCOUNTS_B1SLQuery" ( "Id", "ACCOUNTNAME", "ACCOUNT", "Type", "AcctName", "AcctCode", "ActCurr", "Store" ) AS ((((((SELECT
	 0 AS "Id",
	 '' AS "ACCOUNTNAME",
	 '' AS "ACCOUNT",
	 1 AS "Type",
	 '' AS "AcctName",
	 '' AS "AcctCode",
	 '##' AS "ActCurr",
	 '##' AS "Store" 
						FROM dummy) UNION ALL (SELECT
	 0 AS "Id",
	 '' AS "ACCOUNTNAME",
	 '' AS "ACCOUNT",
	 2 AS "Type",
	 '' AS "AcctName",
	 '' AS "AcctCode",
	 '##' AS "ActCurr",
	 '##' AS "Store" 
						FROM dummy)) UNION ALL (SELECT
	 0 AS "Id",
	 '' AS "ACCOUNTNAME",
	 '' AS "ACCOUNT",
	 3 AS "Type",
	 '' AS "AcctName",
	 '' AS "AcctCode",
	 '##' AS "ActCurr",
	 '##' AS "Store" 
					FROM dummy)) UNION ALL (SELECT
	 0 AS "Id",
	 CONCAT(CONCAT(T0."Segment_0",
	 '-'),
	 T0."AcctName") AS "ACCOUNTNAME",
	 T0."AcctCode" AS "ACCOUNT",
	 1 AS "Type",
	 T0."AcctName",
	 T0."AcctCode",
	 T0."ActCurr",
	 '01' AS "Store" 
				FROM "OACT" T0 
				WHERE T0."Finanse" = 'Y')) UNION ALL (SELECT
	 T0."CreditCard" AS "Id",
	 T0."CardName" AS "ACCOUNTNAME",
	 T0."AcctCode" AS "ACCOUNT",
	 2 AS "Type",
	 T0."CardName",
	 T0."AcctCode",
	 T1."ActCurr",
	 '01' AS "Store" 
			FROM "OCRC" T0 
			INNER JOIN "OACT" T1 ON T1."AcctCode" = T0."AcctCode")) UNION ALL (SELECT
	 0 AS "Id",
	 CONCAT(CONCAT(T0."Segment_0",
	 '-'),
	 T0."AcctName") AS "ACCOUNTNAME",
	 T0."AcctCode" AS "ACCOUNT",
	 3 AS "Type",
	 T0."AcctName",
	 T0."AcctCode",
	 T0."ActCurr",
	 '01' AS "Store" 
		FROM "OACT" T0 
		WHERE T0."Finanse" = 'Y')) WITH READ ONLY;



--1-----------------------------------------------------------1--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_ACTIVITIES_B1SLQuery" ( "ActivityCode", "Activity", "ActivityType", "CardCode", "CardName", "Subject", "HandledBy", "ContactPersonCode", "Phone", "Details", "StartDate", "EndDueDate", "StartTime", "EndTime", "Duration", "Priority", "Location", "Country", "State", "Street", "City", "Room", "Status", "RecurrencePattern", "Interval", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "SeriesStartDate", "SeriesEndDate", "EndType", "MaxOccurrence", "RepeatOption", "RecurrenceDayInMonth", "RecurrenceSequenceSpecifier", "RecurrenceDayOfWeek", "RecurrenceMonth", "Reminder", "ReminderPeriod", "InactiveFlag", "Closed", "CreateDate", "DocType", "DocNum", "DocEntry", "CardCodeDefault", "CodeDefault" ) AS SELECT
	 "ClgCode" AS "ActivityCode",
	 ( CASE "Action" WHEN 'C' 
	THEN 'cn_Conversation' WHEN 'M' 
	THEN 'cn_Meeting' WHEN 'T' 
	THEN 'cn_Task' WHEN 'E' 
	THEN 'cn_Note' WHEN 'P' 
	THEN 'cn_Campaign' WHEN 'N' 
	THEN 'cn_Other' 
	ELSE NULL 
	END ) AS "Activity",
	 "CntctType" AS "ActivityType",
	 BusinessPartner."CardCode" AS "CardCode",
	 BusinessPartner."CardName" AS "CardName",
	 "CntctSbjct" AS "Subject",
	 COALESCE("AssignedBy",
	0) AS "HandledBy",
	 COALESCE("CntctCode",
	0) AS "ContactPersonCode",
	 "Tel" AS "Phone",
	 "Details" AS "Details",
	 CAST("Recontact" AS DATE) AS "StartDate",
	 CAST("endDate" AS DATE) AS "EndDueDate",
	 "BeginTime" AS "StartTime",
	 "ENDTime" AS "EndTime",
	 "Duration" AS "Duration",
	 OCLG."Priority" AS "Priority",
	 "Location" AS "Location",
    OCLG."country" AS "Country",
    "state" AS "State",
    "street" AS "Street",
    OCLG."city" AS "City",
    "room" AS "Room",
    "status" AS "Status",
	 ( CASE "RecurPat" WHEN 'N' 
	THEN 'rpNone' WHEN 'D' 
	THEN 'rpDaily' WHEN 'W' 
	THEN 'rpWeekly' WHEN 'M' 
	THEN 'rpMonthly' WHEN 'A' 
	THEN 'rpAnnually' 
	ELSE NULL 
	END ) AS "RecurrencePattern",
	 "Interval" AS "Interval",
	 ( CASE "Monday" WHEN 'Y' 
	THEN 'tYES' WHEN 'N' 
	THEN 'tNO' 
	ELSE '' 
	END ) AS "Monday",
	 ( CASE "Tuesday" WHEN 'Y' 
	THEN 'tYES' WHEN 'N' 
	THEN 'tNO' 
	ELSE '' 
	END ) AS "Tuesday",
	 ( CASE "Wednesday" WHEN 'Y' 
	THEN 'tYES' WHEN 'N' 
	THEN 'tNO' 
	ELSE '' 
	END ) AS "Wednesday",
	 ( CASE "Thursday" WHEN 'Y' 
	THEN 'tYES' WHEN 'N' 
	THEN 'tNO' 
	ELSE '' 
	END ) AS "Thursday",
	 ( CASE "Friday" WHEN 'Y' 
	THEN 'tYES' WHEN 'N' 
	THEN 'tNO' 
	ELSE '' 
	END ) AS "Friday",
	 ( CASE "Saturday" WHEN 'Y' 
	THEN 'tYES' WHEN 'N' 
	THEN 'tNO' 
	ELSE '' 
	END ) AS "Saturday",
	 ( CASE "Sunday" WHEN 'Y' 
	THEN 'tYES' WHEN 'N' 
	THEN 'tNO' 
	ELSE '' 
	END ) AS "Sunday",
	 COALESCE(CAST("SeStartDat" AS DATE),
	 CAST(CURRENT_DATE AS DATE)) AS "SeriesStartDate",
	 COALESCE(CAST ("SeEndDat" AS DATE),
	 CAST(CURRENT_DATE AS DATE)) AS "SeriesEndDate",
	 ( CASE "EndType" WHEN 'N' 
	THEN 'etNoEndDate' WHEN 'C' 
	THEN 'etByCounter' WHEN 'D' 
	THEN 'etByDate' 
	ELSE NULL 
	END ) AS "EndType",
	 COALESCE("MaxOccur",
	0) AS "MaxOccurrence",
	 ( CASE "SubOption" WHEN 1 
	THEN 'roByDate' WHEN 2 
	THEN 'roByWeekDay' 
	ELSE NULL 
	END ) AS "RepeatOption",
	 COALESCE("DayInMonth",
	0) AS "RecurrenceDayInMonth",
	 ( CASE "Week" WHEN 1 
	THEN 'rsFirst' WHEN 2 
	THEN 'rsFourth' WHEN 3 
	THEN 'rsLast' WHEN 4 
	THEN 'rsSecond' WHEN 5 
	THEN 'rsThird' 
	ELSE NULL 
	END ) AS "RecurrenceSequenceSpecifier",
	 ( CASE "DayOfWeek" WHEN 0 
	THEN 'rdowDay' WHEN 1 
	THEN 'rdowWeekDay' WHEN 2 
	THEN 'rdowWeekendDay' WHEN 3 
	THEN 'rdowSun' WHEN 4 
	THEN 'rdowMon' WHEN 5 
	THEN 'rdowTue' WHEN 6 
	THEN 'rdowWed' WHEN 7 
	THEN 'rdowThu' WHEN 8 
	THEN 'rdowFri' WHEN 9 
	THEN 'rdowSat' 
	ELSE NULL 
	END ) AS "RecurrenceDayOfWeek",
	 COALESCE("Month",
	 0) AS "RecurrenceMonth",
	 ( CASE "Reminder" WHEN 'Y' 
	THEN 'tYES' WHEN 'N' 
	THEN 'tNO' 
	ELSE '' 
	END ) AS "Reminder",
	 "RemQty" AS "ReminderPeriod",
	 ( CASE "inactive" WHEN 'Y' 
	THEN 'tYES' WHEN 'N' 
	THEN 'tNO' 
	ELSE '' 
	END ) AS "InactiveFlag",
	 ( CASE "Closed" WHEN 'Y' 
	THEN 'tYES' WHEN 'N' 
	THEN 'tNO' 
	ELSE '' 
	END ) AS "Closed",
	 CAST(OCLG."CreateDate" AS DATE) AS "CreateDate",
	 "DocType",
	 "DocNum",
	 OCLG."DocEntry",
	 '' AS "CardCodeDefault",
	 0 AS "CodeDefault" 
FROM "OCLG" 
LEFT JOIN "OCRD" BusinessPartner ON OCLG."CardCode" = BusinessPartner."CardCode" WITH READ ONLY;



--2-----------------------------------------------------------2--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_ACTIVITYSTATES_B1SLQuery" ( "StatusId", "Name" ) AS SELECT
	"statusID" AS "StatusId",
	"name" AS "Name"
FROM "OCLA" WHERE "Locked" = 'Y' WITH READ ONLY;



--3-----------------------------------------------------------3--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_APDOWNPAYMENROWS_B1SLQUERY" ( "LineNum", "LineStatus", "DocEntry", "ItemCode", "ItemDescription", "UnitPrice", "Quantity", "DiscountPercent", "WarehouseCode", "TaxCode", "TaxRate", "UoMEntry", "TaxOnly", "WhsName", "Currency", "VATLiable" ) AS SELECT
	 PurchaseReturnRows."LineNum",
	 PurchaseReturnRows."LineStatus",
	 PurchaseReturnRows."DocEntry",
	 PurchaseReturnRows."ItemCode",
	 PurchaseReturnRows."Dscription" AS "ItemDescription",
	 COALESCE(PurchaseReturnRows."PriceBefDi",
	 0) AS "UnitPrice",
	 PurchaseReturnRows."Quantity",
	 COALESCE(PurchaseReturnRows."DiscPrcnt",
	 0) AS "DiscountPercent",
	 PurchaseReturnRows."WhsCode" AS "WarehouseCode",
	 PurchaseReturnRows."TaxCode",
	 CLVS_D_MLT_SLT_TAXRATE(PurchaseReturnRows."TaxCode") AS "TaxRate",
	 PurchaseReturnRows."UomEntry" AS "UoMEntry",
	 PurchaseReturnRows."TaxOnly",
	 Warehouse."WhsName",
	 PurchaseReturnRows."Currency",
	 (CAST(
			CASE 
				WHEN PurchaseReturnRows."TaxStatus" = 'Y' THEN 1
				ELSE 0
			END AS INT)
		)AS "VATLiable" 
FROM "DPO1" PurchaseReturnRows 
LEFT JOIN "OWHS" Warehouse ON PurchaseReturnRows."WhsCode" = Warehouse."WhsCode" WITH READ ONLY;



--4-----------------------------------------------------------4--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_APDOWNPAYMENT_B1SLQuery" ( "DocEntry", "DocNum", "SalesPersonCode", "CardCode", "CardName", "TaxDate", "DocDueDate", "DocDate", "DocDateOrder", "DocDateFilter", "DocCurrency", "PaymentGroupCode", "PriceList", "Comments", "DocStatus", "DocTotal", "CardNameDefault", "CardCodeDefault", "SlpCodeDefault", "DocNumDefault", "DocStatusDefault", "CurrencyDefault", "InvoiceNumber", "AttachmentEntry" ) AS SELECT
	 "DocEntry",
	 "DocNum",
	 "SlpCode" AS "SalesPersonCode",
	 "CardCode",
	 "CardName",
	 CAST("TaxDate" AS DATE) AS "TaxDate",
	 CAST("DocDueDate" AS DATE) AS "DocDueDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE(APDownPayment."DocTime",
	 APDownPayment."DocDate") AS "DocDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE(APDownPayment."DocTime", APDownPayment."DocDate") AS "DocDateOrder",
	 CAST(APDownPayment."DocDate" AS DATE) AS "DocDateFilter",
	 "DocCur" AS "DocCurrency",
	 "GroupNum" AS "PaymentGroupCode",
	 COALESCE(APDownPayment."U_ListNum",
	 0) AS "PriceList",
	 "Comments",
	 "DocStatus",
	 CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY(APDownPayment."DocCur") = 1 
THEN APDownPayment."DocTotal" 
ELSE APDownPayment."DocTotalFC" 
END AS "DocTotal",
	 '' AS "CardNameDefault",
	 '' AS "CardCodeDefault",
	 0 AS "SlpCodeDefault",
	 0 AS "DocNumDefault",
	 'ALL' AS "DocStatusDefault",
	 'ALL' AS "CurrencyDefault",
	 APDownPayment."U_DocumentKey" AS "InvoiceNumber" ,
	 APDownPayment."AtcEntry" AS "AttachmentEntry" 
FROM "ODPO" APDownPayment WITH READ ONLY;



--5-----------------------------------------------------------5--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_APPROVAL_QUERIES" ( "FilterBy", "Condition", "Value", "DocType", "Wtmcode" ) AS SELECT
	 'CardCode' AS "FilterBy",
	 'eq' AS "Condition",
	 "CardCode" AS "Value",
	 13 AS "DocType",
	 24 AS "Wtmcode" 
FROM "OINV" 
WHERE "DocTotal" > "PaidToDate" 
AND DAYS_BETWEEN("DocDueDate",
	 CURRENT_DATE) > 8 
GROUP BY "CardCode" WITH READ ONLY;



--6-----------------------------------------------------------6--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_APPROVER_AUTORITHATION_B1SLQuery" ( "SapLicense", "DocEntry", "Email" ) AS SELECT
	 USR."U_NAME" AS "SapLicense",
	 OWD."DraftEntry" as "DocEntry" ,
	 USR."E_Mail" AS "Email"
FROM OWDD as OWD 
INNER JOIN OWTM as OWT ON OWT."WtmCode"=OWD."WtmCode" 
INNER JOIN OWST as WST ON WST."WstCode"=OWD."CurrStep" 
INNER JOIN WST1 as WST1 ON WST1."WstCode"=WST."WstCode" 
INNER JOIN OUSR as USR ON USR."USERID"=WST1."UserID" WITH READ ONLY;



--7-----------------------------------------------------------7--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_APPRO_QS_WITH_USER_B1SLQuery" ( "FilterBy", "Condition", "Value", "DocType", "Wtmcode", "SapLicense" ) AS SELECT
	 AQ."FilterBy",
	 AQ."Condition",
	 AQ."Value",
	 AQ."DocType",
	 AQ."Wtmcode",
	 USR."USER_CODE" AS "SapLicense" 
FROM "CLVS_D_MLT_SLT_APPROVAL_QUERIES" AQ JOIN "OWTM" WTM ON WTM."WtmCode" = AQ."Wtmcode" JOIN "WTM1" TM1 ON WTM."WtmCode" = TM1."WtmCode" JOIN "WTM3" TM3 ON AQ."Wtmcode" = TM3."WtmCode" JOIN "OUSR" USR ON TM1."UserID" = USR."USERID" 
WHERE AQ."DocType" = TM3."TransType" 
AND WTM."Active" = 'Y' WITH READ ONLY;



--8-----------------------------------------------------------8--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_ARDOWMPAYMENTS_DETAILTRANSAC" ( "DocEntry", "SysNumber", "DistNumber", "ItemCode", "MdAbsEntry", "AbsEntry", "Quantity", "DocLine", "BinAbs" ) AS SELECT
    "InventoryTransactionsLog"."DocEntry" AS "DocEntry",
    "BatchDetailsTransac"."SysNumber" AS "SysNumber",
    "SerialNumbers"."DistNumber" AS "DistNumber",
    "SerialNumbers"."ItemCode" AS "ItemCode",
    "BatchDetailsTransac"."MdAbsEntry",
    "SerialNumbers"."AbsEntry",
    "SerialNumbers"."Quantity",
    "InventoryTransactionsLog"."DocLine",
    COALESCE("Bin"."BinAbs", 0) AS "BinAbs"
FROM
    "OITL" AS "InventoryTransactionsLog"
INNER JOIN
    "ITL1" AS "BatchDetailsTransac" ON "InventoryTransactionsLog"."LogEntry" = "BatchDetailsTransac"."LogEntry"
    AND "InventoryTransactionsLog"."DocType" = '203'
INNER JOIN
    "OSRN" AS "SerialNumbers" ON "BatchDetailsTransac"."MdAbsEntry" = "SerialNumbers"."AbsEntry"
LEFT JOIN
    "OSBQ" AS "Bin" ON "SerialNumbers"."AbsEntry" = "Bin"."SnBMDAbs" WITH READ ONLY;



--9-----------------------------------------------------------9--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_ARDOWNPAYMENTCLOSED_B1SLQuery" ( "DocEntry", "DocNum", "CardCode", "CardName", "DocDate", "DocDateFilter", "DocCurrency", "PaymentGroupCode", "PriceLists", "DocStatus", "DocTotal", "Saldo", "VatSum", "CardNameDefault", "CardCodeDefault", "SlpCodeDefault", "DocNumDefault", "DocStatusDefault" ) AS SELECT
	 "ARDownPayment"."DocEntry",
	 "ARDownPayment"."DocNum",
	 "ARDownPayment"."CardCode",
	 "ARDownPayment"."CardName",
	 CLVS_D_MLT_SLT_DOCFULLDATE("ARDownPayment"."DocTime",
	 "ARDownPayment"."DocDate") AS "DocDate",
	 CAST("ARDownPayment"."DocDate" AS DATE) AS "DocDateFilter",
	 "ARDownPayment"."DocCur" AS "DocCurrency",
	 "ARDownPayment"."GroupNum" AS "PaymentGroupCode",
	 COALESCE("ARDownPayment"."U_ListNum",
	 0) AS "PriceLists",
	 "ARDownPayment"."DocStatus" AS "DocStatus",
	 ( CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY("ARDownPayment"."DocCur") = 1 
	THEN "ARDownPayment"."PaidSum" 
	ELSE "ARDownPayment"."PaidSumFc" 
	END ) AS "DocTotal",
	 CLVS_D_MLT_SLT_DOWNPAYMENTAPPLIED("ARDownPayment"."DocEntry") AS "Saldo",
	 ( CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY("ARDownPayment"."DocCur") = 1 
	THEN COALESCE("ARDownPayment"."VatSum",
	 0) 
	ELSE COALESCE("ARDownPayment"."VatSumFC",
	 0) 
	END ) AS "VatSum",
	 '' AS "CardNameDefault",
	 '' AS "CardCodeDefault",
	 0 AS "SlpCodeDefault",
	 0 AS "DocNumDefault",
	 'ALL' AS "DocStatusDefault" 
FROM "ODPI" AS "ARDownPayment" 
INNER JOIN "DPI6" AS "ARDownPaymentInstallments" ON "ARDownPayment"."DocEntry" = "ARDownPaymentInstallments"."DocEntry" 
WHERE "ARDownPayment"."CANCELED" = 'N' 
AND "ARDownPayment"."DpmStatus" = 'O' 
AND "ARDownPayment"."DpmDrawn" = 'N' 
AND "ARDownPayment"."PaidSum" <> 0 
AND ("ARDownPayment"."Posted" = 'Y' 
	OR ("ARDownPayment"."Posted" = 'N' 
		AND "ARDownPayment"."DocStatus" = 'C')) WITH READ ONLY;



--10-----------------------------------------------------------10--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_ARDOWNPAYMENTROWS_B1SLQuery" ( "ItemCode", "ItemDescription", "UnitPrice", "DiscountPercent", "Quantity", "TaxCode", "TaxRate", "WarehouseCode", "WhsName", "Currency", "BaseLine", "BaseEntry", "BaseType", "LineStatus", "CostingCode", "UomEntry", "LineNum", "TreeType", "InventoryItem", "ManSerNum", "ManBtchNum", "OnHand", "LastPurchasePrice", "ItemGroupCode", "ItemClass", "DistNumber", "SysNumber", "DocEntry", "SNDocEntry", "SNQuantity", "FatherCode", "TaxOnly", "HideComp", "VATLiable" ) AS SELECT
	 DISTINCT ARDownPaymentRows."ItemCode" AS "ItemCode",
	 ARDownPaymentRows."Dscription" AS "ItemDescription",
	 CAST(ARDownPaymentRows."PriceBefDi" AS DECIMAL(18,
	 2)) AS "UnitPrice",
	 CAST(COALESCE(ARDownPaymentRows."DiscPrcnt",
	 0) AS DECIMAL(18,
	 2)) AS "DiscountPercent",
	 CAST(ARDownPaymentRows."Quantity" AS DECIMAL(18,
	 2)) AS "Quantity",
	 ARDownPaymentRows."TaxCode" AS "TaxCode",
	 CAST(ARDownPaymentRows."VatPrcnt" AS DECIMAL(18,
	 2)) AS "TaxRate",
	 ARDownPaymentRows."WhsCode" AS "WarehouseCode",
	 Warehouse."WhsName" AS "WhsName",
	 ARDownPaymentRows."Currency",
	 ARDownPaymentRows."BaseLine" AS "BaseLine",
	 ARDownPaymentRows."BaseEntry" AS "BaseEntry",
	 ARDownPaymentRows."BaseType" AS "BaseType",
	 ARDownPaymentRows."LineStatus" AS "LineStatus",
	 ARDownPaymentRows."OcrCode" AS "CostingCode",
	 ARDownPaymentRows."UomEntry" AS "UomEntry",
	 ARDownPaymentRows."LineNum" AS "LineNum",
	 (CASE ARDownPaymentRows."TreeType" WHEN 'N' 
	THEN 'iNotATree' WHEN 'S' 
	THEN 'iSalesTree' WHEN 'I' 
	THEN 'iIngredient' 
	ELSE '' 
	END ) AS "TreeType",
	 Items."InvntItem" AS "InventoryItem",
	 Items."ManSerNum" AS "ManSerNum",
	 Items."ManBtchNum" AS "ManBtchNum",
	 CAST( CASE WHEN (ItemsWarehouse."OnHand" ) > 0 
	THEN CAST(ItemsWarehouse."OnHand" AS DECIMAL(18,
	 2)) 
	ELSE 0 
	END AS DECIMAL(18,
	 2)) AS "OnHand",
	 CAST(ItemsWarehouse."AvgPrice" AS DECIMAL(18,
	 2)) AS "LastPurchasePrice",
	 CAST(ItemGroups."ItmsGrpCod" AS INT) AS "ItemGroupCode",
	 ItemGroups."ItemClass" AS "ItemClass",
	 COALESCE(SerialNumbers."DistNumber",
	 '') AS "DistNumber",
	 COALESCE(SerialNumbers."SysNumber",
	 0) AS "SysNumber",
	 ARDownPaymentRows."DocEntry" AS "DocEntry",
	 SerialNumbers."DocEntry" AS "SNDocEntry",
	 SerialNumbers."Quantity" AS "SNQuantity",
	 ITT1."Father" AS "FatherCode",
	 ARDownPaymentRows."TaxOnly" AS "TaxOnly" ,
	 OIT."HideComp" AS "HideComp",
	 (CAST(
			CASE 
				WHEN ARDownPaymentRows."TaxStatus" = 'Y' THEN 1
				ELSE 0
			END AS INT)
		)AS "VATLiable"  
FROM "DPI1" ARDownPaymentRows 
INNER JOIN "OITM" Items ON ARDownPaymentRows."ItemCode" = Items."ItemCode" 
INNER JOIN "ITM1" ItemsPrices ON ARDownPaymentRows."ItemCode" = ItemsPrices."ItemCode" 
INNER JOIN "OITW" ItemsWarehouse ON Items."ItemCode" = ItemsWarehouse."ItemCode" 
AND ARDownPaymentRows."WhsCode" = ItemsWarehouse."WhsCode" 
INNER JOIN "OWHS" Warehouse ON ItemsWarehouse."WhsCode" = Warehouse."WhsCode" 
AND ARDownPaymentRows."WhsCode" = Warehouse."WhsCode" 
INNER JOIN "OITB" ItemGroups ON Items."ItmsGrpCod" = ItemGroups."ItmsGrpCod" 
AND ARDownPaymentRows."ItemCode" = Items."ItemCode" 
LEFT JOIN "ITT1" ON "ITT1"."Father" = ARDownPaymentRows."ItemCode" 
LEFT JOIN "OITT" OIT ON OIT."Code"=Items."ItemCode" 
LEFT JOIN "CLVS_D_MLT_SLT_ORDER_DETAILTRANSAC" SerialNumbers ON ARDownPaymentRows."ItemCode" = SerialNumbers."ItemCode" 
AND SerialNumbers."DocLine" = ARDownPaymentRows."LineNum" 
AND SerialNumbers."DocEntry" = ARDownPaymentRows."DocEntry" WITH READ ONLY;



--11-----------------------------------------------------------11--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_ARDOWNPAYMENT_B1SLQuery" ( "DocEntry", "DocNum", "SalesPersonCode", "CardCode", "CardName", "TaxDate", "DocDueDate", "DocDate", "DocDateOrder", "DocDateFilter", "DocCurrency", "PaymentGroupCode", "PriceList", "Comments", "DocStatus", "DocTotal", "CardNameDefault", "CardCodeDefault", "SlpCodeDefault", "DocNumDefault", "DocStatusDefault", "CurrencyDefault", "InvoiceNumber", "AttachmentEntry" ) AS SELECT
	 "DocEntry",
	 "DocNum",
	 "SlpCode" AS "SalesPersonCode",
	 "CardCode",
	 "CardName",
	 CAST("TaxDate" AS DATE) AS "TaxDate",
	 CAST("DocDueDate" AS DATE) AS "DocDueDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE("ARDownPayment"."DocTime",
	 "ARDownPayment"."DocDate") AS "DocDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE("ARDownPayment"."DocTime", "ARDownPayment"."DocDate") AS "DocDateOrder",
	 CAST("ARDownPayment"."DocDate" AS DATE) AS "DocDateFilter",
	 "ARDownPayment"."DocCur" AS "DocCurrency",
	 "ARDownPayment"."GroupNum" AS "PaymentGroupCode",
	 COALESCE("ARDownPayment"."U_ListNum",
	 0) AS "PriceList",
	 "ARDownPayment"."Comments",
	 "ARDownPayment"."DocStatus" AS "DocStatus",
	 ( CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY("ARDownPayment"."DocCur") = 1 
	THEN "ARDownPayment"."DocTotal" 
	ELSE "ARDownPayment"."DocTotalFC" 
	END ) AS "DocTotal",
	 '' AS "CardNameDefault",
	 '' AS "CardCodeDefault",
	 0 AS "SlpCodeDefault",
	 0 AS "DocNumDefault",
	 'ALL' AS "DocStatusDefault",
	 'ALL' AS "CurrencyDefault",
	 "ARDownPayment"."U_DocumentKey" AS "InvoiceNumber" ,
	 "ARDownPayment"."AtcEntry" AS "AttachmentEntry" 
FROM "ODPI" AS "ARDownPayment" ORDER BY "ARDownPayment"."DocDate" DESC WITH READ ONLY;



--12-----------------------------------------------------------12--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_ARINVOICEROWS_B1SLQuery" ( "DocEntry", "LineNum", "LineTotal", "ItemCode", "ItemDescription", "UnitPrice", "Currency", "Quantity", "DiscountPercent", "TaxCode", "TaxRate", "WarehouseCode", "CostingCode", "BaseType", "BaseEntry", "BaseLine", "UoMEntry", "OnHand", "TreeType", "FatherCode", "ManBtchNum", "ManSerNum", "LineStatus", "TaxOnly", "InventoryItem", "HideComp", "VATLiable" ) AS SELECT
	 DISTINCT "ARInvoiceRows"."DocEntry" AS "DocEntry",
	 "ARInvoiceRows"."LineNum" AS "LineNum",
	 "ARInvoiceRows"."LineTotal" AS "LineTotal",
	 "ARInvoiceRows"."ItemCode" AS "ItemCode",
	 "ARInvoiceRows"."Dscription" AS "ItemDescription",
	 "ARInvoiceRows"."PriceBefDi" AS "UnitPrice",
	 "ARInvoiceRows"."Currency",
	 "ARInvoiceRows"."Quantity" AS "Quantity",
	 COALESCE("ARInvoiceRows"."DiscPrcnt",
	 0) AS "DiscountPercent",
	 "ARInvoiceRows"."TaxCode" AS "TaxCode",
	 "ARInvoiceRows"."VatPrcnt" AS "TaxRate",
	 "ARInvoiceRows"."WhsCode" AS "WarehouseCode",
	 "ARInvoiceRows"."OcrCode" AS "CostingCode",
	 "ARInvoiceRows"."BaseType" AS "BaseType",
	 "ARInvoiceRows"."BaseEntry" AS "BaseEntry",
	 "ARInvoiceRows"."BaseLine" AS "BaseLine",
	 "ARInvoiceRows"."UomEntry" AS "UoMEntry",
	 CASE WHEN "IT"."OnHand" > 0 
THEN CAST("IT"."OnHand" AS DECIMAL(18,
	 2)) 
ELSE 0 
END AS "OnHand",
	 CASE "ARInvoiceRows"."TreeType" WHEN 'N' 
THEN 'iNotATree' WHEN 'S' 
THEN 'iSalesTree' WHEN 'I' 
THEN 'iIngredient' 
ELSE '' 
END AS "TreeType",
	 "ITT1"."Father" AS "FatherCode",
	 "Items"."ManBtchNum",
	 "Items"."ManSerNum",
	 "ARInvoiceRows"."LineStatus",
	 "ARInvoiceRows"."TaxOnly" AS "TaxOnly",
	 "Items"."InvntItem" AS "InventoryItem",
	 "OIT"."HideComp" AS "HideComp",
	 (CAST(
			CASE 
				WHEN "ARInvoiceRows"."TaxStatus" = 'Y' THEN 1
				ELSE 0
			END AS INT)
		)AS "VATLiable" 
FROM "INV1" AS "ARInvoiceRows" 
INNER JOIN "OITM" AS "Items" ON "ARInvoiceRows"."ItemCode" = "Items"."ItemCode" 
INNER JOIN "OITM" AS "Item" ON "ARInvoiceRows"."ItemCode" = "Item"."ItemCode" 
INNER JOIN "OITW" AS "IT" ON "IT"."ItemCode" = "Item"."ItemCode" 
AND "IT"."WhsCode" = "ARInvoiceRows"."WhsCode" 
LEFT JOIN "ITT1" ON "ARInvoiceRows"."ItemCode" = "ITT1"."Father" 
LEFT JOIN "OITT" AS "OIT" ON "OIT"."Code"="Items"."ItemCode" WITH READ ONLY;



--13-----------------------------------------------------------13--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_ARINVOICES_B1SLQuery" ( "DocEntry", "DocNum", "CardCode", "CardName", "SalesPersonCode", "SalesPersonName", "TaxDate", "DocDueDate", "DocDate", "DocDateOrder", "DocDateFilter", "DocCurrency", "ReserveInvoice", "PaymentGroupCode", "Series", "PriceList", "Comments", "DocTotal", "DocStatus", "IdTranRedimir", "IdTranAcumular", "CardNameDefault", "CardCodeDefault", "SlpCodeDefault", "DocNumDefault", "InvoiceNumber", "DocStatusDefault", "CurrencyDefault", "Email", "IdType", "Identification", "TipoDocE", "AttachmentEntry" ) AS SELECT
	 "ARInvoice"."DocEntry" AS "DocEntry",
	 "ARInvoice"."DocNum" AS "DocNum",
	 "ARInvoice"."CardCode" AS "CardCode",
	 "ARInvoice"."CardName" AS "CardName",
	 COALESCE("SalesPerson"."SlpCode",
	 0) AS "SalesPersonCode",
	 COALESCE("SalesPerson"."SlpName",
	 '---') AS "SalesPersonName",
	 CAST("TaxDate" AS DATE) AS "TaxDate",
	 CAST("DocDueDate" AS DATE) AS "DocDueDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE("ARInvoice"."DocTime",
	 "ARInvoice"."DocDate") AS "DocDate",
	 "ARInvoice"."DocTime" AS "DocDateOrder",
	 CAST("ARInvoice"."DocDate" AS DATE) AS "DocDateFilter",
	 "ARInvoice"."DocCur" AS "DocCurrency",
	 COALESCE("ARInvoice"."isIns",
	 'N') AS "ReserveInvoice",
	 "ARInvoice"."GroupNum" AS "PaymentGroupCode",
	 "ARInvoice"."Series" AS "Series",
	 COALESCE("ARInvoice"."U_ListNum",
	 0) AS "PriceList",
	 "ARInvoice"."Comments" AS "Comments",
	 CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY("ARInvoice"."DocCur") = 1 
THEN "ARInvoice"."DocTotal" 
ELSE "ARInvoice"."DocTotalFC" 
END AS "DocTotal",
	 "ARInvoice"."DocStatus" AS "DocStatus",
	 COALESCE("ARInvoice"."U_EMA_numTransaccion_redimir",
	 '') AS "IdTranRedimir",
	 COALESCE("ARInvoice"."U_EMA_numTransaccion_acumular",
	 '') AS "IdTranAcumular",
	 '' AS "CardNameDefault",
	 '' AS "CardCodeDefault",
	 0 AS "SlpCodeDefault",
	 0 AS "DocNumDefault",
	 "ARInvoice"."U_DocumentKey" AS "InvoiceNumber",
	 'ALL' AS "DocStatusDefault",
	 'ALL' AS "CurrencyDefault",
	 COALESCE("ARInvoice"."U_CorreoFE",
	 '') AS "Email",
	 COALESCE("ARInvoice"."U_TipoIdentificacion",
	 '') AS "IdType",
	 COALESCE("ARInvoice"."U_NumIdentFE",
	 '') AS "Identification",
	 COALESCE("ARInvoice"."U_TipoDocE",
	 '') AS "TipoDocE" ,
	 "ARInvoice"."AtcEntry" AS "AttachmentEntry" 
FROM "OINV" AS "ARInvoice" 
LEFT JOIN "OSLP" AS "SalesPerson" ON "SalesPerson"."SlpCode" = "ARInvoice"."SlpCode" WITH READ ONLY;



--14-----------------------------------------------------------14--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_ARINVOICETOPRINT_B1SLQuery" ( "CardCode", "CardName", "DocCurrency", "FederalTaxID", "Phone", "DocEntry", "DocDate", "DocNum", "NumFE", "ClaveFE", "DocTotal", "SalesPerson", "ItemName", "Tax", "Quantity", "DiscountPercent", "TaxRate", "UnitPrice", "Discount", "Currency", "LineTotal" ) AS SELECT
	 "Invoices"."CardCode",
	 "Invoices"."CardName",
	 "Invoices"."DocCur" AS "DocCurrency",
	 COALESCE("BusinessPartner"."LicTradNum",
	 '---') AS "FederalTaxID",
	 COALESCE("BusinessPartner"."Phone1",
	 '---') AS "Phone",
	 "Invoices"."DocEntry",
	 "Invoices"."DocDate",
	 "Invoices"."DocNum",
	 COALESCE(FEData."U_NConsecFE", '') AS "NumFE",
	 COALESCE(FEData."U_NClaveFE", '') AS "ClaveFE",
	 CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY("Invoices"."DocCur") = 1 
THEN "Invoices"."DocTotal" 
ELSE "Invoices"."DocTotalFC" 
END AS "DocTotal",
	 COALESCE("SalesPerson"."SlpName",
	 '---') AS "SalesPerson",
	 CASE WHEN "InvoicesRows"."UomEntry" > -1 
THEN CONCAT("InvoicesRows"."Dscription",
	 ' - [' || "InvoicesRows"."UomCode" || ']') 
ELSE "InvoicesRows"."Dscription" 
END AS "ItemName",
	 CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY("Invoices"."DocCur") = 1 
THEN "Invoices"."VatSum" 
ELSE "Invoices"."VatSumFC" 
END AS "Tax",
	 "InvoicesRows"."Quantity",
	 COALESCE("InvoicesRows"."DiscPrcnt",
	 0) AS "DiscountPercent",
	 COALESCE("InvoicesRows"."VatPrcnt",
	 0) AS "TaxRate",
	 "InvoicesRows"."PriceBefDi" AS "UnitPrice",
	 ("InvoicesRows"."PriceBefDi" - "InvoicesRows"."Price") AS "Discount",
	 "InvoicesRows"."Currency" AS "Currency",
	 CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY("Invoices"."DocCur") = 1 
THEN "InvoicesRows"."LineTotal" 
ELSE "InvoicesRows"."TotalFrgn" 
END AS "LineTotal" 
FROM "OINV" AS "Invoices" 
INNER JOIN "INV1" AS "InvoicesRows" ON "Invoices"."DocEntry" = "InvoicesRows"."DocEntry" 
INNER JOIN "OCRD" AS "BusinessPartner" ON "Invoices"."CardCode" = "BusinessPartner"."CardCode" 
INNER JOIN "OSLP" AS "SalesPerson" ON "Invoices"."SlpCode" = "SalesPerson"."SlpCode" 
LEFT JOIN  "@NCLAVEFE" FEData ON FEData."U_DocEntry" = "InvoicesRows"."DocEntry" AND FEData."U_TipoDoc" = 'FE' WITH READ ONLY;



--15-----------------------------------------------------------15--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_AUTHOR_AUTORITHATION_B1SLQuery" ( "SapLicense", "DocEntry", "Email" ) AS SELECT
	 USR."U_NAME" AS "SapLicense",
	 ORD."DocEntry" as "DocEntry" ,
	 USR."E_Mail" AS "Email"
FROM ODRF AS ORD 
INNER JOIN OUSR AS USR ON USR."USERID"=ORD."UserSign" WITH READ ONLY;



--16-----------------------------------------------------------16--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_BANKS_B1SLQuery" ( "BankCode", "BankName" ) AS SELECT
    "BankCodes"."BankCode",
    "BankCodes"."BankName" 
FROM 
    "ODSC" AS "BankCodes";



--17-----------------------------------------------------------17--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_BARCODES_B1SLQuery" ( "ItemNo", "Barcode", "FreeText", "AbsEntry" ) AS SELECT
    "BarcodeMasterData"."ItemCode" AS "ItemNo",
    "BarcodeMasterData"."BcdCode" AS "Barcode",
    "BarcodeMasterData"."BcdName" AS "FreeText",
    "BarcodeMasterData"."BcdEntry" AS "AbsEntry"
FROM 
    "OBCD" AS "BarcodeMasterData"
WHERE 
    "BarcodeMasterData"."BcdCode" IS NOT NULL
AND 
    LENGTH("BarcodeMasterData"."BcdCode") > 0;



--18-----------------------------------------------------------18--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_BATCH_STOCK" ( "ItemCode", "WhsCode", "Quantity", "Type" ) AS SELECT
	 "ItemCode",
	 "WhsCode",
	 SUM("Quantity" - "CommitQty") AS "Quantity",
	 3 "Type" 
FROM "OBTQ" 
GROUP BY "ItemCode" ,
	 "WhsCode" WITH READ ONLY;



--19-----------------------------------------------------------19--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_BEAUTHORIZEDOCUMENT_B1SLQuery" ( "Value", "WtmCode", "TransType", "UniqueId" ) AS SELECT 
	CAST(1 AS TINYINT) AS "Value",
	M3."WtmCode",
	M3."TransType",
	RF."U_DocumentKey" AS "UniqueId"
FROM 
	"WTM3" AS M3
JOIN 
	"OWTM" AS TM ON TM."WtmCode" = M3."WtmCode"
JOIN 
	"OWDD" AS DD ON DD."WtmCode" = TM."WtmCode"
JOIN 
	"ODRF" AS RF ON DD."DraftEntry" = RF."DocEntry"
WHERE
	TM."Active" = 'Y' WITH READ ONLY;



--20-----------------------------------------------------------20--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_BINFROMWHS_B1SLQuery" ( "AbsEntry", "BinCode", "ItemCode", "WhsCode", "OnHandQty" ) AS SELECT
	BinLocation."AbsEntry",
	BinLocation."BinCode",
	BinQty."ItemCode",
	BinQty."WhsCode",
	BinQty."OnHandQty"
FROM "OIBQ" AS BinQty
INNER JOIN "OBIN" AS BinLocation ON BinQty."BinAbs" = BinLocation."AbsEntry"
WHERE BinQty."OnHandQty" > 0 WITH READ ONLY;



--21-----------------------------------------------------------21--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_BINLOCATION" ( "ItemCode", "OnHandQty", "AbsEntry", "BinCode", "WhsCode" ) AS SELECT
    ItemBin."ItemCode",
    ItemBin."OnHandQty",
    Locations."AbsEntry",
    Locations."BinCode",
    ItemBin."WhsCode"
FROM
    OIBQ ItemBin
INNER JOIN
    OBIN Locations
ON
    ItemBin."BinAbs" = Locations."AbsEntry"
WHERE
    ItemBin."OnHandQty" > 0 WITH READ ONLY;



--22-----------------------------------------------------------22--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_BLANKETAGREEMENTDETAILS_B1SLQuery" ( "AbsID", "ItemCode", "ItemGroup", "UnitPrice", "PlanQty", "Currency", "Discount" ) AS SELECT
	 OA."AbsID",
	 "AT"."ItemCode",
	 "AT"."ItemGroup",
	 CAST(COALESCE("AT"."UnitPrice",
	 0) AS DECIMAL) AS "UnitPrice",
	 CAST(COALESCE("AT"."PlanQty",
	 0) AS DECIMAL) AS "PlanQty",
	 "AT"."Currency" ,
	 "AT"."Discount" AS "Discount"
FROM "OOAT" AS OA JOIN "OAT1" AS "AT" ON "AT"."AgrNo" = OA."AbsID" WITH READ ONLY;



--23-----------------------------------------------------------23--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_BLANKETAGREEMENTS_B1SLQuery" ( "AbsID", "CardCode", "BpType", "StartDate", "EndDate", "TerminationDate", "Description", "Type", "PayMethod", "Status", "UpdateDateTime", "Method" ) AS SELECT
	 OA."AbsID",
	 OA."BpCode" AS "CardCode",
	 OA."BpType",
	 OA."StartDate",
	 CAST(OA."EndDate" AS DATE) AS "EndDate",
	 OA."TermDate" AS "TerminationDate",
	 COALESCE(OA."Descript",
	 '') AS "Description",
	 OA."Type",
	 OA."PayMethod",
	 OA."Status",
	 CLVS_D_MLT_SLT_TIMESPAN(CLVS_D_MLT_SLT_DOCFULLDATE(0, COALESCE(OA."UpdtDate", OA."CreateDate")), COALESCE(OA."UpdtTime", 0)) AS "UpdateDateTime" ,
	 OA."Method"
FROM "OOAT" AS OA 
WHERE OA."Status" = 'A' 
AND CAST(OA."EndDate" AS DATE) >= CURRENT_DATE AND CAST(OA."StartDate" AS DATE) <= CURRENT_DATE WITH READ ONLY;



--24-----------------------------------------------------------24--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_BPADDRESS_B1SLQuery" ( "AddressName", "AddressName2", "AddressName3", "Street", "Block", "City", "County", "Country", "State", "AddressType", "BPCode", "GlobalLocationNumber", "StreetNo", "BuildingFloorRoom", "RowNum", "Provincia", "Canton", "Distrito", "Barrio", "AddressNameDefault" ) AS SELECT
	"Address" AS "AddressName",
	"Address2" AS "AddressName2",
	"Address3" AS "AddressName3",
	"Street" AS "Street",
	"Block" AS "Block",
	"City" AS "City",
	"County" AS "County",
	"Country" AS "Country",
	"State" AS "State",
	CASE "AdresType" 
		WHEN 'B' THEN 'bo_BillTo' 
		WHEN 'S' THEN 'bo_ShipTo'
		ELSE ''
	END AS "AddressType",
	"CardCode" AS "BPCode",
	"GlblLocNum" AS "GlobalLocationNumber",
	"StreetNo" AS "StreetNo",
	"Building" AS "BuildingFloorRoom",
	"LineNum" AS "RowNum",
	'' AS "Provincia",
	'' AS "Canton",
	'' AS "Distrito",
	'' AS "Barrio",
	'' AS "AddressNameDefault"
FROM "CRD1";



--25-----------------------------------------------------------25--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_BPBYCEDULAXML_B1SLQuery" ( "CardCode", "CardName", "LicTradNum" ) AS SELECT
	Bps."CardCode",
	Bps."CardName",
	Bps."LicTradNum"
FROM "OCRD" Bps
INNER JOIN "OCTG" T1
	ON Bps."CardType" = 'S'
	AND Bps."frozenFor" = 'N'
	AND Bps."GroupNum" = T1."GroupNum" WITH READ ONLY;



--26-----------------------------------------------------------26--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_BPPROPERTIES_B1SLQuery" ( "Id", "GroupCode", "GroupName" ) AS SELECT  
	"GroupCode" AS "Id",
	CONCAT('Properties', "GroupCode") AS "GroupCode",
	"GroupName"
FROM "OCQG";



--27-----------------------------------------------------------27--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_BPPROPERTY_B1SLQuery" ( "CardCode", "Properties1", "Properties2", "Properties3", "Properties4", "Properties5", "Properties6", "Properties7", "Properties8", "Properties9", "Properties10", "Properties11", "Properties12", "Properties13", "Properties14", "Properties15", "Properties16", "Properties17", "Properties18", "Properties19", "Properties20", "Properties21", "Properties22", "Properties23", "Properties24", "Properties25", "Properties26", "Properties27", "Properties28", "Properties29", "Properties30", "Properties31", "Properties32", "Properties33", "Properties34", "Properties35", "Properties36", "Properties37", "Properties38", "Properties39", "Properties40", "Properties41", "Properties42", "Properties43", "Properties44", "Properties45", "Properties46", "Properties47", "Properties48", "Properties49", "Properties50", "Properties51", "Properties52", "Properties53", "Properties54", "Properties55", "Properties56", "Properties57", "Properties58", "Properties59", "Properties60", "Properties61", "Properties62", "Properties63", "Properties64" ) AS SELECT 
	"CardCode",
    "QryGroup1" AS "Properties1", 
    "QryGroup2" AS "Properties2", 
    "QryGroup3" AS "Properties3", 
    "QryGroup4" AS "Properties4", 
    "QryGroup5" AS "Properties5",
    "QryGroup6" AS "Properties6", 
    "QryGroup7" AS "Properties7", 
    "QryGroup8" AS "Properties8", 
    "QryGroup9" AS "Properties9", 
    "QryGroup10" AS "Properties10",
    "QryGroup11" AS "Properties11", 
    "QryGroup12" AS "Properties12", 
    "QryGroup13" AS "Properties13", 
    "QryGroup14" AS "Properties14", 
    "QryGroup15" AS "Properties15",
    "QryGroup16" AS "Properties16", 
    "QryGroup17" AS "Properties17", 
    "QryGroup18" AS "Properties18", 
    "QryGroup19" AS "Properties19", 
    "QryGroup20" AS "Properties20",
    "QryGroup21" AS "Properties21", 
    "QryGroup22" AS "Properties22", 
    "QryGroup23" AS "Properties23", 
    "QryGroup24" AS "Properties24", 
    "QryGroup25" AS "Properties25",
    "QryGroup26" AS "Properties26", 
    "QryGroup27" AS "Properties27", 
    "QryGroup28" AS "Properties28", 
    "QryGroup29" AS "Properties29", 
    "QryGroup30" AS "Properties30",
    "QryGroup31" AS "Properties31", 
    "QryGroup32" AS "Properties32", 
    "QryGroup33" AS "Properties33", 
    "QryGroup34" AS "Properties34", 
    "QryGroup35" AS "Properties35",
    "QryGroup36" AS "Properties36", 
    "QryGroup37" AS "Properties37", 
    "QryGroup38" AS "Properties38", 
    "QryGroup39" AS "Properties39", 
    "QryGroup40" AS "Properties40",
    "QryGroup41" AS "Properties41", 
    "QryGroup42" AS "Properties42", 
    "QryGroup43" AS "Properties43", 
    "QryGroup44" AS "Properties44", 
    "QryGroup45" AS "Properties45",
    "QryGroup46" AS "Properties46", 
    "QryGroup47" AS "Properties47", 
    "QryGroup48" AS "Properties48", 
    "QryGroup49" AS "Properties49", 
    "QryGroup50" AS "Properties50",
    "QryGroup51" AS "Properties51", 
    "QryGroup52" AS "Properties52", 
    "QryGroup53" AS "Properties53", 
    "QryGroup54" AS "Properties54", 
    "QryGroup55" AS "Properties55",
    "QryGroup56" AS "Properties56", 
    "QryGroup57" AS "Properties57", 
    "QryGroup58" AS "Properties58", 
    "QryGroup59" AS "Properties59", 
    "QryGroup60" AS "Properties60",
    "QryGroup61" AS "Properties61", 
    "QryGroup62" AS "Properties62", 
    "QryGroup63" AS "Properties63", 
    "QryGroup64" AS "Properties64"
FROM "OCRD";



--28-----------------------------------------------------------28--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_BUSINESSPARTNERLOCS_B1SLQuery" ( "CardCode", "AddressLineNum", "Address", "Latitude", "Longitude", "IsDefault", "OtherSigns", "AddressLineId", "AddressType", "DefaultType" ) AS SELECT
	"Customer"."CardCode",
	"Addrss"."LineNum" AS "AddressLineNum",
	"Addrss"."Address",
	"Addrss"."StreetNo" AS "Latitude",
	"Addrss"."Building" AS "Longitude",
	(CASE
		WHEN COALESCE("Customer"."BillToDef", '-1') = "Addrss"."Address" THEN 1
		ELSE 0
	END) AS "IsDefault",
	"Addrss"."County" AS "OtherSigns",
	"Addrss"."ZipCode" AS "AddressLineId",
	(CASE
		WHEN COALESCE("Addrss"."AdresType", 'B') = 'B' THEN 0
		ELSE 1
	END) AS "AddressType",
	-1 AS "DefaultType"
FROM "OCRD" AS "Customer"
INNER JOIN "CRD1" AS "Addrss"
	ON "Customer"."CardCode" = "Addrss"."CardCode" WITH READ ONLY;



--29-----------------------------------------------------------29--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_BUSINESSPARTNERSGROUPS_B1SLQuery" ( "Code", "Name", "GroupType" ) AS SELECT	
	"GroupCode" AS "Code",
	"GroupName" AS "Name",
	"GroupType" AS "GroupType"
FROM "OCRG" AS BusinessPartnerGroups;



--30-----------------------------------------------------------30--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_BUSINESSPARTNERS_B1SLQuery" ( "CardCode", "CardName", "FilterUpperCase", "CardType", "FederalTaxID", "EmailAddress", "Address", "Phone1", "Currency", "PayTermsGrpCode", "GroupCode", "FatherType", "DiscountPercent", "MaxCommitment", "Frozen", "PriceListNum", "SalesPersonCode", "BilltoDefault", "ShiptoDefault", "TypeIdentification", "Provincia", "Canton", "Distrito", "Barrio", "Direccion", "CashCustomer", "Device", "DocDateFilter" ) AS SELECT
	 "CardCode" AS "CardCode",
	 "CardName" AS "CardName",
	 UPPER(CONCAT("CardCode", CONCAT(' ', "CardName"))) AS "FilterUpperCase",
	 "CardType" AS "CardType",
	 "LicTradNum" AS "FederalTaxID",
	 "E_Mail" AS "EmailAddress",
	 "Address" AS "Address",
	 "Phone1" AS "Phone1",
	 "Currency" AS "Currency",
	 "GroupNum" AS "PayTermsGrpCode",
	 "GroupCode" AS "GroupCode",
	 "FatherType" AS "FatherType",
	 "Discount" AS "DiscountPercent",
	 "DebtLine" AS "MaxCommitment",
	 (CASE "frozenFor" WHEN 'Y' 
	THEN 'tYES' WHEN 'N' 
	THEN 'tNO' 
	ELSE '' 
	END) AS "Frozen",
	 "ListNum" AS "PriceListNum",
	 "SlpCode" AS "SalesPersonCode",
	 "BillToDef" AS "BilltoDefault",
	 "ShipToDef" AS "ShiptoDefault",
	 "U_TipoIdentificacion" AS "TypeIdentification",
	 "U_provincia" AS "Provincia",
	 "U_canton" AS "Canton",
	 "U_distrito" AS "Distrito",
	 "U_barrio" AS "Barrio",
	 "U_direccion" AS "Direccion",
	 (CASE WHEN "QryGroup1" = 'Y' 
	THEN 1 
	ELSE 0 
	END) AS "CashCustomer",
	 "U_EMA_Device" AS "Device",
	 "CreateDate" AS "DocDateFilter" 
FROM "OCRD" 
WHERE "frozenFor" = 'N';



--31-----------------------------------------------------------31--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_BUSINESSPARTNERS_UPDATEMAG_B1SLQuery" ( "CardCode", "CardName", "CardType", "FederalTaxID", "Currency", "TypeIdentification", "U_NVT_InscMAG", "U_MagVencimiento" ) AS SELECT
	 TOP 50 "CardCode" AS "CardCode",
	 "CardName" AS "CardName",
	 "CardType" AS "CardType",
	 "LicTradNum" AS "FederalTaxID",
	 "Currency" AS "Currency",
	 "U_TipoIdentificacion" AS "TypeIdentification",
	 "U_NVT_InscMAG" AS "U_NVT_InscMAG",
	 "U_MagVencimiento" AS "U_MagVencimiento" 
FROM "OCRD" 
WHERE "frozenFor" = 'N' WITH READ ONLY;



--32-----------------------------------------------------------32--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_CANCELPAYMENT_B1SLQuery" ( "DocNumOinv", "DocEntryOinv", "DocStatus", "DocEntryPay", "DocNumPay", "DocCurrency", "DocTotal", "DocTotalFC", "DocDate", "DocDateFilter", "DocDateOrder", "CardCode", "DocumentKey", "CardCodeDefault" ) AS SELECT
	 Invoices."DocNum" AS "DocNumOinv",
	 Invoices."DocEntry" AS "DocEntryOinv",
	 CASE WHEN Invoices."DocStatus" = 'O' 
THEN 'Abierto' WHEN Invoices."DocStatus" = 'C' 
THEN 'Cerrado' 
ELSE 'Desconocido' 
END AS "DocStatus",
	 IncomingPayments."DocEntry" AS "DocEntryPay",
	 IncomingPayments."DocNum" AS "DocNumPay",
	 IncomingPayments."DocCurr" AS "DocCurrency",
	 IncomingPayments."DocTotal",
	 IncomingPayments."DocTotalFC",
	 CLVS_D_MLT_SLT_DOCFULLDATE(IncomingPayments."DocTime", IncomingPayments."DocDate") AS "DocDate",
	 IncomingPayments."DocDate" AS "DocDateFilter",
	 CLVS_D_MLT_SLT_DOCFULLDATE(IncomingPayments."DocTime", IncomingPayments."DocDate") AS "DocDateOrder",
	 IncomingPayments."CardCode",
	 Invoices."U_DocumentKey" AS "DocumentKey",
	 '' AS "CardCodeDefault" 
FROM "OINV" AS Invoices 
INNER JOIN "RCT2" AS IncomingPaymentInvoices ON Invoices."DocEntry" = IncomingPaymentInvoices."DocEntry" 
INNER JOIN "ORCT" AS IncomingPayments ON IncomingPaymentInvoices."DocNum" = IncomingPayments."DocEntry" 
WHERE IncomingPayments."Canceled" = 'N' WITH READ ONLY;



--33-----------------------------------------------------------33--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_CHARTDATASET01_B1SLQuery" ( "DataSetId", "LabelId", "Value", "Year", "Month" ) AS SELECT 
    1 AS "DataSetId",
    ROW_NUMBER() OVER () AS "LabelId",
    COUNT(*) AS "Value",
    YEAR(invoice."DocDateFilter") AS "Year",
    MONTH(invoice."DocDateFilter") AS "Month"
FROM 
    "CLVS_D_MLT_SLT_ARINVOICES_B1SLQuery" invoice
WHERE 
    invoice."DocDateFilter" >= ADD_MONTHS(LAST_DAY(ADD_MONTHS(CURRENT_DATE, -3)), 1)
    AND invoice."CardCode" = 'C00001'
GROUP BY 
    YEAR(invoice."DocDateFilter"),
    MONTH(invoice."DocDateFilter") WITH READ ONLY;



--34-----------------------------------------------------------34--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_CNTPERSONACTIVITIES_B1SLQuery" ( "ContactCode", "Name", "CardCode", "Phone" ) AS SELECT 
    "CntctCode" AS "ContactCode",
    "Name",
    "CardCode",
    COALESCE("Tel1", '') AS "Phone"
FROM "OCPR";



--35-----------------------------------------------------------35--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_CNTTYPEACTIVITIES_B1SLQuery" ( "Code", "Name" ) AS SELECT
	 "Code",
	 "Name" 
FROM "OCLT";



--36-----------------------------------------------------------36--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_CONSOLIDATIONBUSINESSPARTHERS_B1SLQuery" ( "CardCode", "CardName", "CardType", "FederalTaxID", "EmailAddress", "Address", "Phone1", "Currency", "PayTermsGrpCode", "GroupCode", "FatherType", "FatherCard", "DiscountPercent", "MaxCommitment", "Frozen", "PriceListNum", "SalesPersonCode", "BilltoDefault", "ShiptoDefault", "TypeIdentification", "Provincia", "Canton", "Distrito", "Barrio", "Direccion", "CashCustomer" ) AS SELECT
	"CardCode" AS "CardCode",
	"CardName" AS "CardName",
	"CardType" AS "CardType",
	"LicTradNum" AS "FederalTaxID",
	"E_Mail" AS "EmailAddress",
	"Address" AS "Address",
	"Phone1" AS "Phone1",
	"Currency" AS "Currency",
	"GroupNum" AS "PayTermsGrpCode",
	"GroupCode" AS "GroupCode",
	CASE "FatherType"
		WHEN 'P' THEN 'cPayments_sum'
		WHEN 'D' THEN 'cDelivery_sum'
		ELSE ''
	END AS "FatherType",
	"FatherCard" AS "FatherCard",
	"Discount" AS "DiscountPercent",
	"DebtLine" AS "MaxCommitment",
	CASE "frozenFor" WHEN 'Y' THEN 'tYES' WHEN 'N' THEN 'tNO' ELSE '' END AS "Frozen",
	"ListNum" AS "PriceListNum",
	"SlpCode" AS "SalesPersonCode",
	"BillToDef" AS "BilltoDefault",
	"ShipToDef" AS "ShiptoDefault",
	"U_TipoIdentificacion" AS "TypeIdentification",
	"U_provincia" AS "Provincia",
	"U_canton" AS "Canton",
	"U_distrito" AS "Distrito",
	"U_barrio" AS "Barrio",
	"U_direccion" AS "Direccion",
	CASE WHEN "QryGroup1" = 'Y' THEN 1 ELSE 0 END AS "CashCustomer"
FROM "OCRD";



--37-----------------------------------------------------------37--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_COUNTRIESACTIVITY_B1SLQuery" ( "Code", "Name" ) AS ((SELECT
	'' as "Code",
	'' as "Name" 
	FROM "OCRY") UNION (SELECT
	"Code",
	"Name"
FROM "OCRY")) WITH READ ONLY;



--38-----------------------------------------------------------38--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_CREDITNEMOS_B1SLQuery" ( "DocEntry", "DocNum", "DocumentType", "CardCode", "CardName", "NumAtCard", "Comments", "DocCurrency", "DocCurrencyDefault", "DocDate", "DocDueDate", "DocDateFilter", "Total", "TotalUSD", "Saldo", "SaldoUSD", "InstlmntID", "TransId", "ObjType" ) AS SELECT
	 NC."DocEntry",
	 NC."DocNum",
	 'Nota de crédito' AS "DocumentType",
	 NC."CardCode",
	 NC."CardName",
	 NC."NumAtCard",
	 NC."Comments",
	 NC."DocCur" AS "DocCurrency",
	 '' AS "DocCurrencyDefault",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime", "DocDate") AS "DocDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime", "DocDueDate") AS "DocDueDate",
	 CAST(NC."DocDate" AS DATE) AS "DocDateFilter",
	 COALESCE(NCInstallments."InsTotal",
	 0) AS "Total",
	 COALESCE(NCInstallments."InsTotalFC",
	 0) AS "TotalUSD",
	 COALESCE(NCInstallments."InsTotal" - NCInstallments."PaidToDate",
	 0) AS "Saldo",
	 COALESCE(NCInstallments."InsTotalFC" - NCInstallments."PaidFC",
	 0) AS "SaldoUSD",
	 NCInstallments."InstlmntID",
	 NC."TransId",
	 NC."ObjType" 
FROM "ORIN" NC 
INNER JOIN "RIN6" NCInstallments ON NC."DocEntry" = NCInstallments."DocEntry" 
WHERE NC."DocStatus" = 'O' WITH READ ONLY;



--39-----------------------------------------------------------39--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_CREDITNOTEROWS_B1SLQuery" ( "DocEntry", "LineNum", "LineTotal", "ItemCode", "ItemDescription", "UnitPrice", "Currency", "Quantity", "DiscountPercent", "TaxCode", "TaxRate", "WarehouseCode", "WhsName", "CostingCode", "BaseType", "BaseEntry", "BaseLine", "LineStatus", "InventoryItem", "OnHand", "ItemGroupCode", "LastPurchasePrice", "LastPurchasePriceFC", "ItemClass", "UomEntry", "ManSerNum", "ManBtchNum", "TreeType", "FatherCode", "TaxOnly", "HideComp", "VATLiable" ) AS SELECT
	 DISTINCT NCRows."DocEntry" AS "DocEntry",
	 NCRows."LineNum" AS "LineNum",
	 NCRows."LineTotal" AS "LineTotal",
	 NCRows."ItemCode" AS "ItemCode",
	 NCRows."Dscription" AS "ItemDescription",
	 NCRows."PriceBefDi" AS "UnitPrice",
	 NCRows."Currency" AS "Currency",
	 NCRows."Quantity" AS "Quantity",
	 COALESCE(NCRows."DiscPrcnt",
	 0) AS "DiscountPercent",
	 NCRows."TaxCode" AS "TaxCode",
	 NCRows."VatPrcnt" AS "TaxRate",
	 NCRows."WhsCode" AS "WarehouseCode",
	 Warehouse."WhsName" AS "WhsName",
	 NCRows."OcrCode" AS "CostingCode",
	 NCRows."BaseType" AS "BaseType",
	 NCRows."BaseEntry" AS "BaseEntry",
	 NCRows."LineNum" as "BaseLine",
	 NCRows."LineStatus" AS "LineStatus",
	 Item."InvntItem" AS "InventoryItem",
	 CASE WHEN IT."OnHand" > 0 
THEN TO_DECIMAL(IT."OnHand",
	 18,
	 2) 
ELSE 0 
END AS "OnHand",
	 CAST(Item."ItmsGrpCod" AS INT) AS "ItemGroupCode",
	 TO_DECIMAL((SELECT
	 SIT."AvgPrice" 
		FROM "OITW" SIT 
		WHERE SIT."ItemCode" = Item."ItemCode" 
		AND SIT."WhsCode" = NCRows."WhsCode"),
	 18,
	 2) AS "LastPurchasePrice",
	 - 1 AS "LastPurchasePriceFC",
	 (SELECT
	 T1."ItemClass" 
	FROM "OITB" T1 
	WHERE Item."ItmsGrpCod" = T1."ItmsGrpCod") AS "ItemClass",
	 NCRows."UomEntry" AS "UomEntry",
	 Item."ManSerNum" AS "ManSerNum",
	 Item."ManBtchNum" AS "ManBtchNum",
	 CASE NCRows."TreeType" WHEN 'N' 
THEN 'iNotATree' WHEN 'S' 
THEN 'iSalesTree' WHEN 'I' 
THEN 'iIngredient' 
ELSE '' 
END AS "TreeType",
	 COALESCE( billMat."Father",
	 '') AS "FatherCode",
	 NCRows."TaxOnly" AS "TaxOnly",
	 OIT."HideComp" AS "HideComp",
	 (CAST(
			CASE 
				WHEN NCRows."TaxStatus" = 'Y' THEN 1
				ELSE 0
			END AS INT)
		)AS "VATLiable" 
FROM "RIN1" AS NCRows 
INNER JOIN "OITM" AS Item ON NCRows."ItemCode" = Item."ItemCode" 
INNER JOIN "OITW" AS IT ON IT."ItemCode" = Item."ItemCode" 
AND IT."WhsCode" = NCRows."WhsCode" 
INNER JOIN "OWHS" AS Warehouse ON IT."WhsCode" = Warehouse."WhsCode" 
AND NCRows."WhsCode" = Warehouse."WhsCode" 
LEFT JOIN "ITT1" AS billMat ON NCRows."ItemCode" = billMat."Father" 
LEFT JOIN OITT AS OIT ON OIT."Code"=Item."ItemCode" WITH READ ONLY;



--40-----------------------------------------------------------40--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_CREDITNOTES_B1SLQuery" ( "DocEntry", "DocNum", "CardCode", "CardName", "SalesPersonCode", "SalesPersonName", "TaxDate", "DocDueDate", "DocDate", "DocDateOrder", "DocDateFilter", "DocCurrency", "PaymentGroupCode", "PriceList", "Series", "Comments", "DocStatus", "DocTotal", "CardNameDefault", "CardCodeDefault", "SlpCodeDefault", "DocNumDefault", "DocStatusDefault", "CurrencyDefault", "Email", "IdType", "Identification", "TipoDocE", "AttachmentEntry" ) AS SELECT
	 NC."DocEntry" AS "DocEntry",
	 NC."DocNum" AS "DocNum",
	 NC."CardCode" AS "CardCode",
	 NC."CardName" AS "CardName",
	 COALESCE(SalesPerson."SlpCode",
	 0) AS "SalesPersonCode",
	 COALESCE(SalesPerson."SlpName",
	 '---') AS "SalesPersonName",
	 CAST(NC."TaxDate" AS DATE) AS "TaxDate",
	 CAST(NC."DocDueDate" AS DATE) AS "DocDueDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE(NC."DocTime",
	 NC."DocDate") AS "DocDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE(NC."DocTime", NC."DocDate") AS "DocDateOrder",
	 CAST(NC."DocDate" AS DATE) AS "DocDateFilter",
	 NC."DocCur" AS "DocCurrency",
	 NC."GroupNum" AS "PaymentGroupCode",
	 COALESCE(NC."U_ListNum",
	 0) AS "PriceList",
	 NC."Series" AS "Series",
	 NC."Comments" AS "Comments",
	 NC."DocStatus" AS "DocStatus",
	 CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY(NC."DocCur") = 1 
THEN NC."DocTotal" 
ELSE NC."DocTotalFC" 
END AS "DocTotal",
	 '' AS "CardNameDefault",
	 '' AS "CardCodeDefault",
	 0 AS "SlpCodeDefault",
	 0 AS "DocNumDefault",
	 'ALL' AS "DocStatusDefault",
	 'ALL' AS "CurrencyDefault",
	 COALESCE(NC."U_CorreoFE",
	 '') AS "Email",
	 COALESCE(NC."U_TipoIdentificacion",
	 '') AS "IdType",
	 COALESCE(NC."U_NumIdentFE",
	 '') AS "Identification",
	 COALESCE(NC."U_TipoDocE",
	 '') AS "TipoDocE" ,
	 NC."AtcEntry" AS "AttachmentEntry" 
FROM "ORIN" NC 
LEFT JOIN "OSLP" SalesPerson ON SalesPerson."SlpCode" = NC."SlpCode" WITH READ ONLY;



--41-----------------------------------------------------------41--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_CREDITNOTETOPRINT_B1SLQuery" ( "CardCode", "CardName", "DocCurrency", "FederalTaxID", "Phone", "DocEntry", "DocDate", "DocNum", "NumFE", "ClaveFE", "DocTotal", "SalesPerson", "ItemName", "Tax", "Quantity", "DiscountPercent", "TaxRate", "UnitPrice", "Discount", "Currency", "LineTotal" ) AS SELECT
	 "CreditNote"."CardCode",
	 "CreditNote"."CardName",
	 "CreditNote"."DocCur" AS "DocCurrency",
	 COALESCE("BusinessPartner"."LicTradNum",
	 '---') AS "FederalTaxID",
	 COALESCE("BusinessPartner"."Phone1",
	 '---') AS "Phone",
	 "CreditNote"."DocEntry",
	 "CreditNote"."DocDate",
	 "CreditNote"."DocNum",
	 COALESCE(FEData."U_NConsecFE",
	 '') AS "NumFE",
	 COALESCE(FEData."U_NClaveFE",
	 '') AS "ClaveFE",
	 CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY("CreditNote"."DocCur") = 1 
THEN "CreditNote"."DocTotal" 
ELSE "CreditNote"."DocTotalFC" 
END AS "DocTotal",
	 COALESCE("SalesPerson"."SlpName",
	 '---') AS "SalesPerson",
	 CASE WHEN "CreditNoteRows"."UomEntry" > -1 
THEN CONCAT("CreditNoteRows"."Dscription",
	 ' - [' || "CreditNoteRows"."UomCode" || ']') 
ELSE "CreditNoteRows"."Dscription" 
END AS "ItemName",
	 CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY("CreditNote"."DocCur") = 1 
THEN "CreditNote"."VatSum" 
ELSE "CreditNote"."VatSumFC" 
END AS "Tax",
	 "CreditNoteRows"."Quantity",
	 COALESCE("CreditNoteRows"."DiscPrcnt",
	 0) AS "DiscountPercent",
	 COALESCE("CreditNoteRows"."VatPrcnt",
	 0) AS "TaxRate",
	 "CreditNoteRows"."PriceBefDi" AS "UnitPrice",
	 ("CreditNoteRows"."PriceBefDi" - "CreditNoteRows"."Price") AS "Discount",
	 "CreditNoteRows"."Currency" AS "Currency",
	 CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY("CreditNote"."DocCur") = 1 
THEN "CreditNoteRows"."LineTotal" 
ELSE "CreditNoteRows"."TotalFrgn" 
END AS "LineTotal" 
FROM "ORIN" AS "CreditNote" 
INNER JOIN "RIN1" AS "CreditNoteRows" ON "CreditNote"."DocEntry" = "CreditNoteRows"."DocEntry" 
INNER JOIN "OCRD" AS "BusinessPartner" ON "CreditNote"."CardCode" = "BusinessPartner"."CardCode" 
INNER JOIN "OSLP" AS "SalesPerson" ON "CreditNote"."SlpCode" = "SalesPerson"."SlpCode" 
LEFT JOIN "@NCLAVEFE" FEData ON FEData."U_DocEntry" = "CreditNoteRows"."DocEntry" 
AND FEData."U_TipoDoc" = 'FE' WITH READ ONLY;



--42-----------------------------------------------------------42--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_CREDITSUM" ( "CreditSum", "DocEntry" ) AS SELECT
	SUM("IncomingPaymentsCreditVouchers"."CreditSum") AS "CreditSum",
	"IncomingPaymentsCreditVouchers"."DocNum" AS "DocEntry"
FROM "RCT3" "IncomingPaymentsCreditVouchers"
GROUP BY "IncomingPaymentsCreditVouchers"."DocNum" WITH READ ONLY;



--43-----------------------------------------------------------43--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_CREDITVOUCHERS_B1SLQuery" ( "Id", "CreditCard", "VoucherNum", "CreditSum", "CardValid", "CollectionDate", "Account", "DocNum", "IsManualEntry" ) AS SELECT
	 "LineID" AS "Id",
	 "CreditCard" AS "CreditCard",
	 "VoucherNum" AS "VoucherNum",
	 "CreditSum" AS "CreditSum",
	 "CardValid" AS "CardValid",
	 "FirstDue" AS "CollectionDate",
	 "CreditAcct" AS "Account",
	 "DocNum" AS "DocNum",
	 CAST(COALESCE("U_ManualEntry",0) AS INT) AS "IsManualEntry" 
FROM "RCT3";



--44-----------------------------------------------------------44--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_CURRADDITIONAL_B1SLQuery" ( "ItemCode", "PriceList", "Currency", "Currency1", "Currency2", "Price", "AddPrice1", "AddPrice2" ) AS SELECT
	 "ItemPrices"."ItemCode",
	 "ItemPrices"."PriceList",
	 CASE WHEN "UoMPrices"."Currency" IS NULL 
OR LENGTH("UoMPrices"."Currency") = 0 
THEN "ItemPrices"."Currency" 
ELSE '' 
END AS "Currency",
	 CASE WHEN "UoMPrices"."Currency1" IS NULL 
OR LENGTH("UoMPrices"."Currency1") = 0 
THEN "ItemPrices"."Currency1" 
ELSE '' 
END AS "Currency1",
	 CASE WHEN "UoMPrices"."Currency2" IS NULL 
OR LENGTH("UoMPrices"."Currency2") = 0 
THEN "ItemPrices"."Currency2" 
ELSE '' 
END AS "Currency2",
	 COALESCE("UoMPrices"."Price",
	 COALESCE("ItemPrices"."Price",
	 0)) AS "Price",
	 COALESCE("UoMPrices"."AddPrice1",
	 COALESCE("ItemPrices"."AddPrice1",
	 0)) AS "AddPrice1",
	 COALESCE("UoMPrices"."AddPrice2",
	 COALESCE("ItemPrices"."AddPrice2",
	 0)) AS "AddPrice2" 
FROM "ITM1" AS "ItemPrices" 
INNER JOIN "OPLN" AS "PriceList" ON "ItemPrices"."PriceList" = "PriceList"."ListNum" 
AND "PriceList"."ValidFor" ='Y' 
LEFT JOIN "ITM9" AS "UoMPrices" ON "ItemPrices"."ItemCode" = "UoMPrices"."ItemCode" WITH READ ONLY;



--45-----------------------------------------------------------45--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_CURRENCIES_B1SLQuery" ( "Id", "Name", "Symbol", "IsLocal" ) AS (((SELECT
	 '##' AS "Id",
	 'Todas' AS "Name",
	 N'##' AS "Symbol",
	 0 AS "IsLocal" 
			FROM DUMMY) UNION ALL (SELECT
	 'COL' AS "Id",
	 'Colones' AS "Name",
	 N'₡' AS "Symbol",
	 1 AS "IsLocal" 
			FROM DUMMY)) UNION ALL (SELECT
	 'USD' AS "Id",
	 'Dólares' AS "Name",
	 N'$' AS "Symbol",
	 0 AS "IsLocal" 
		FROM DUMMY)) WITH READ ONLY;



--46-----------------------------------------------------------46--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_DELIVERYNOTESROWS_B1SLQUERY" ( "ItemCode", "ItemDescription", "UnitPrice", "Currency", "DiscountPercent", "Quantity", "TaxCode", "TaxRate", "WarehouseCode", "WhsName", "BaseLine", "BaseEntry", "BaseType", "LineStatus", "CostingCode", "UomEntry", "LineNum", "TreeType", "InventoryItem", "ManSerNum", "ManBtchNum", "OnHand", "LastPurchasePrice", "ItemGroupCode", "ItemClass", "DistNumber", "SysNumber", "SODocEntry", "SORDocEntry", "SNDocEntry", "CardCode", "SNQuantity", "FatherCode", "TaxOnly", "HideComp", "VATLiable" ) AS SELECT
	 DISTINCT DeliveryRows."ItemCode" AS "ItemCode",
	 DeliveryRows."Dscription" AS "ItemDescription",
	 CAST(DeliveryRows."PriceBefDi" AS DECIMAL(18,
	 2)) AS "UnitPrice",
	 DeliveryRows."Currency",
	 CAST(IFNULL(DeliveryRows."DiscPrcnt",
	 0) AS DECIMAL(18,
	 2)) AS "DiscountPercent",
	 CAST(DeliveryRows."Quantity" AS DECIMAL(18,
	 2)) AS "Quantity",
	 DeliveryRows."TaxCode" AS "TaxCode",
	 CAST(DeliveryRows."VatPrcnt" AS DECIMAL(18,
	 2)) AS "TaxRate",
	 DeliveryRows."WhsCode" AS "WarehouseCode",
	 Warehouse."WhsName" AS "WhsName",
	 DeliveryRows."BaseLine" AS "BaseLine",
	 DeliveryRows."BaseEntry" AS "BaseEntry",
	 DeliveryRows."BaseType" AS "BaseType",
	 DeliveryRows."LineStatus" AS "LineStatus",
	 DeliveryRows."OcrCode" AS "CostingCode",
	 DeliveryRows."UomEntry" AS "UomEntry",
	 DeliveryRows."LineNum" AS "LineNum",
	 CASE DeliveryRows."TreeType" WHEN 'N' 
THEN 'iNotATree' WHEN 'S' 
THEN 'iSalesTree' WHEN 'I' 
THEN 'iIngredient' 
ELSE '' 
END AS "TreeType",
	 Items."InvntItem" AS "InventoryItem",
	 Items."ManSerNum" AS "ManSerNum",
	 Items."ManBtchNum" AS "ManBtchNum",
	 CAST(CASE WHEN (ItemsWarehouse."OnHand" ) > 0 
	THEN CAST(ItemsWarehouse."OnHand" AS DECIMAL(18,
	 2)) 
	ELSE 0 
	END AS DECIMAL(18,
	 2)) AS "OnHand",
	 CAST(ItemsWarehouse."AvgPrice" AS DECIMAL(18,
	 2)) AS "LastPurchasePrice",
	 CAST(ItemGroups."ItmsGrpCod" AS INT) AS "ItemGroupCode",
	 ItemGroups."ItemClass" AS "ItemClass",
	 IFNULL(SerialNumbers."DistNumber",
	 '') AS "DistNumber",
	 IFNULL(SerialNumbers."SysNumber",
	 0) AS "SysNumber",
	 Delivery."DocEntry" AS "SODocEntry",
	 DeliveryRows."DocEntry" AS "SORDocEntry",
	 SerialNumbers."DocEntry" AS "SNDocEntry",
	 Delivery."CardCode" AS "CardCode",
	 SerialNumbers."Quantity" AS "SNQuantity",
	 ITT1."Father" AS "FatherCode",
	 DeliveryRows."TaxOnly" AS "TaxOnly",
	 OIT."HideComp" AS "HideComp",
	 (CAST(
			CASE 
				WHEN DeliveryRows."TaxStatus" = 'Y' THEN 1
				ELSE 0
			END AS INT)
		)AS "VATLiable" 
FROM "ODLN" Delivery 
INNER JOIN "OCRD" BusinessPartner ON Delivery."CardCode" = BusinessPartner."CardCode" 
INNER JOIN "DLN1" DeliveryRows ON Delivery."DocEntry" = DeliveryRows."DocEntry" 
INNER JOIN "OITM" Items ON DeliveryRows."ItemCode" = Items."ItemCode" 
INNER JOIN "ITM1" ItemsPrices ON DeliveryRows."ItemCode" = ItemsPrices."ItemCode" 
INNER JOIN "OITW" ItemsWarehouse ON Items."ItemCode" = ItemsWarehouse."ItemCode" 
AND DeliveryRows."WhsCode" = ItemsWarehouse."WhsCode" 
INNER JOIN "OWHS" Warehouse ON ItemsWarehouse."WhsCode" = Warehouse."WhsCode" 
AND DeliveryRows."WhsCode" = Warehouse."WhsCode" 
INNER JOIN "OITB" ItemGroups ON Items."ItmsGrpCod" = ItemGroups."ItmsGrpCod" 
AND DeliveryRows."ItemCode" = Items."ItemCode" 
LEFT JOIN "ITT1" ON ITT1."Father" = DeliveryRows."ItemCode" 
LEFT JOIN "OITT" OIT ON OIT."Code"=Items."ItemCode" 
LEFT JOIN "CLVS_D_MLT_SLT_ORDER_DETAILTRANSAC" SerialNumbers ON DeliveryRows."ItemCode" = SerialNumbers."ItemCode" 
AND SerialNumbers."DocLine" = DeliveryRows."LineNum" 
AND SerialNumbers."DocEntry" = DeliveryRows."DocEntry" WITH READ ONLY;



--47-----------------------------------------------------------47--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_DELIVERYNOTES_B1SLQuery" ( "DocEntry", "DocNum", "CardCode", "CardName", "SalesPersonCode", "SalesPersonName", "TaxDate", "DocDueDate", "DocDate", "DocDateOrder", "DocDateFilter", "DocCurrency", "PaymentGroupCode", "PriceList", "Comments", "DocTotal", "DocStatus", "CardNameDefault", "CardCodeDefault", "SlpCodeDefault", "DocNumDefault", "DocStatusDefault", "CurrencyDefault", "Email", "IdType", "Identification", "TipoDocE" ) AS SELECT
	 "Delivery"."DocEntry" AS "DocEntry",
	 "Delivery"."DocNum" AS "DocNum",
	 "Delivery"."CardCode" AS "CardCode",
	 "Delivery"."CardName" AS "CardName",
	 "SalesPerson"."SlpCode" AS "SalesPersonCode",
	 "SalesPerson"."SlpName" AS "SalesPersonName",
	 CAST("Delivery"."TaxDate" AS DATE) AS "TaxDate",
	 CAST("Delivery"."DocDueDate" AS DATE) AS "DocDueDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime", "DocDate") AS "DocDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime", "DocDate") AS "DocDateOrder",
	 "Delivery"."DocDate" AS "DocDateFilter",
	 "Delivery"."DocCur" AS "DocCurrency",
	 "Delivery"."GroupNum" AS "PaymentGroupCode",
	 COALESCE("Delivery"."U_ListNum",
	 0) AS "PriceList",
	 "Delivery"."Comments" AS "Comments",
	 CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY("Delivery"."DocCur") = 1 
THEN "Delivery"."DocTotal" 
ELSE "Delivery"."DocTotalFC" 
END AS "DocTotal",
	 "Delivery"."DocStatus" AS "DocStatus",
	 '' AS "CardNameDefault",
	 '' AS "CardCodeDefault",
	 0 AS "SlpCodeDefault",
	 0 AS "DocNumDefault",
	 'ALL' AS "DocStatusDefault",
	 'ALL' AS "CurrencyDefault" ,
	 COALESCE("Delivery"."U_CorreoFE",
	'') AS "Email",
	 COALESCE("Delivery"."U_TipoIdentificacion",
	'') AS "IdType",
	 COALESCE("Delivery"."U_NumIdentFE",
	'') as "Identification",
	 COALESCE("Delivery"."U_TipoDocE",
	'') AS "TipoDocE" 
FROM "ODLN" AS "Delivery" 
INNER JOIN "OSLP" AS "SalesPerson" ON "Delivery"."SlpCode" = "SalesPerson"."SlpCode" WITH READ ONLY;



--48-----------------------------------------------------------48--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_DELIVERYNOTETOPRINT_B1SLQuery" ( "CardCode", "CardName", "DocCurrency", "FederalTaxID", "Phone", "DocEntry", "DocDate", "DocNum", "DocTotal", "SalesPerson", "ItemName", "Tax", "Quantity", "DiscountPercent", "TaxRate", "UnitPrice", "Discount", "Currency", "LineTotal" ) AS SELECT
	 "Delivery"."CardCode",
	 "Delivery"."CardName",
	 "Delivery"."DocCur" AS "DocCurrency",
	 COALESCE("BusinessPartner"."LicTradNum",
	 '---') AS "FederalTaxID",
	 COALESCE("BusinessPartner"."Phone1",
	 '---') AS "Phone",
	 "Delivery"."DocEntry",
	 "Delivery"."DocDate",
	 "Delivery"."DocNum",
	 CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY("Delivery"."DocCur") = 1 
THEN "Delivery"."DocTotal" 
ELSE "Delivery"."DocTotalFC" 
END AS "DocTotal",
	 COALESCE("SalesPerson"."SlpName",
	 '---') AS "SalesPerson",
	 CASE WHEN "DeliveryRows"."UomEntry" > -1 
THEN CONCAT("DeliveryRows"."Dscription",
	 ' - [' || "DeliveryRows"."UomCode" || ']') 
ELSE "DeliveryRows"."Dscription" 
END AS "ItemName",
	 CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY("Delivery"."DocCur") = 1 
THEN "Delivery"."VatSum" 
ELSE "Delivery"."VatSumFC" 
END AS "Tax",
	 "DeliveryRows"."Quantity",
	 COALESCE("DeliveryRows"."DiscPrcnt",
	 0) AS "DiscountPercent",
	 COALESCE("DeliveryRows"."VatPrcnt",
	 0) AS "TaxRate",
	 "DeliveryRows"."PriceBefDi" AS "UnitPrice",
	 ("DeliveryRows"."PriceBefDi" - "DeliveryRows"."Price") AS "Discount",
	 "DeliveryRows"."Currency" AS "Currency",
	 CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY("Delivery"."DocCur") = 1 
THEN "DeliveryRows"."LineTotal" 
ELSE "DeliveryRows"."TotalFrgn" 
END AS "LineTotal" 
FROM "ODLN" AS "Delivery" 
INNER JOIN "DLN1" AS "DeliveryRows" ON "DeliveryRows"."DocEntry" = "Delivery"."DocEntry" 
INNER JOIN "OCRD" AS "BusinessPartner" ON "Delivery"."CardCode" = "BusinessPartner"."CardCode" 
INNER JOIN "OSLP" AS "SalesPerson" ON "Delivery"."SlpCode" = "SalesPerson"."SlpCode" WITH READ ONLY;



--49-----------------------------------------------------------49--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_DETAILBATCHFORNC_B1SLQuery" ( "DocEntry", "SysNumber", "DistNumber", "ItemCode", "Quantity" ) AS SELECT
	"InventoryTransactionsLog"."DocEntry" AS "DocEntry",
	"BatchDetailsTransac"."SysNumber" AS "SysNumber",
	"SerialNumbers"."DistNumber" AS "DistNumber",
	"SerialNumbers"."ItemCode" AS "ItemCode",
	"InventoryTransactionsLog"."DefinedQty" AS "Quantity"
FROM "OITL" AS "InventoryTransactionsLog"
INNER JOIN "ITL1" AS "BatchDetailsTransac"
	ON "InventoryTransactionsLog"."LogEntry" = "BatchDetailsTransac"."LogEntry"
	AND "InventoryTransactionsLog"."DocType" = '13'
INNER JOIN "OBTN" AS "SerialNumbers"
	ON "BatchDetailsTransac"."MdAbsEntry" = "SerialNumbers"."AbsEntry" WITH READ ONLY;



--50-----------------------------------------------------------50--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_DETAILSERIESFORNC_B1SLQuery" ( "DocEntry", "SysNumber", "DistNumber", "ItemCode", "Quantity" ) AS SELECT
	"InventoryTransactionsLog"."DocEntry" AS "DocEntry",
	"SerialNumbers"."SysNumber" AS "SysNumber",
	"SerialNumbers"."DistNumber" AS "DistNumber",
	"SerialNumbers"."ItemCode" AS "ItemCode",
	"InventoryTransactionsLog"."DefinedQty" AS "Quantity"
FROM "OITL" AS "InventoryTransactionsLog"
INNER JOIN "ITL1" AS "BatchDetailsTransac"
	ON "InventoryTransactionsLog"."LogEntry" = "BatchDetailsTransac"."LogEntry"
	AND "InventoryTransactionsLog"."DocType" = '13'
INNER JOIN "OSRN" AS "SerialNumbers"
	ON "BatchDetailsTransac"."MdAbsEntry" = "SerialNumbers"."AbsEntry"
	AND "BatchDetailsTransac"."ItemCode" = "SerialNumbers"."ItemCode" WITH READ ONLY;



--51-----------------------------------------------------------51--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_DETAILTRANSAC" ( "DocEntry", "SysNumber", "DistNumber", "ItemCode", "MdAbsEntry", "AbsEntry", "DocLine", "BinAbs" ) AS SELECT
    InventoryTransactionsLog."DocEntry" AS "DocEntry",
    BatchDetailsTransac."SysNumber" AS "SysNumber",
    SerialNumbers."DistNumber" AS "DistNumber",
    SerialNumbers."ItemCode" AS "ItemCode",
    BatchDetailsTransac."MdAbsEntry",
    SerialNumbers."AbsEntry",
    InventoryTransactionsLog."DocLine",
    COALESCE(Bin."BinAbs", 0) AS "BinAbs"
FROM "OITL" AS InventoryTransactionsLog
INNER JOIN "ITL1" AS BatchDetailsTransac
    ON InventoryTransactionsLog."LogEntry" = BatchDetailsTransac."LogEntry"
    AND InventoryTransactionsLog."DocType" = '1250000001'
INNER JOIN "OSRN" AS SerialNumbers
    ON BatchDetailsTransac."MdAbsEntry" = SerialNumbers."AbsEntry"
LEFT JOIN "OSBQ" AS Bin
    ON SerialNumbers."AbsEntry" = Bin."SnBMDAbs" WITH READ ONLY;



--52-----------------------------------------------------------52--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_DIMENSION_B1SLQUERY" ( "DimCode", "DimName", "DimActive", "DimDesc" ) AS SELECT
	 "DimCode",
	 "DimName",
	 "DimActive",
	 "DimDesc" 
FROM ODIM;



--53-----------------------------------------------------------53--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_DISCGROUP" ( "AbsEntry", "ObjType", "CardGroup", "ItemGroup", "Discount", "GroupType", "DiscRel" ) AS SELECT 
    DRG."AbsEntry",
    DRG."ObjType",
    OED."ObjCode" AS "CardGroup",
    DRG."ObjKey" AS "ItemGroup",
    DRG."Discount",
    OED."Type" AS "GroupType",
	OED."DiscRel" AS "DiscRel"
FROM "OEDG" OED
JOIN "EDG1" DRG 
    ON OED."AbsEntry" = DRG."AbsEntry"
WHERE OED."ValidFor" = 'Y' WITH READ ONLY;



--54-----------------------------------------------------------54--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_DISCOUNTGROUPITEMBP_B1SLQuery" ( "ItemCode", "Discount", "CardCode", "GroupType", "ObjType", "ItemGroup", "CardGroup", "DiscRelBp", "DiscRelItem" ) AS SELECT
		Items."ItemCode" AS "ItemCode",
		COALESCE(DiscountGroupItem."Discount", 0.0) AS "Discount",
		DiscountGroupItem."CardCode" as "CardCode",
		DiscountGroupItem."GroupType",
		DiscountGroupItem."ObjType",
		DiscountGroupItem."ItemGroup",
		DiscountGroupItem."CardGroup" as "CardGroup",
		DiscountGroupItem."DiscRel" as "DiscRelBp",
		DiscountGroupItem."DiscRelIten" as "DiscRelItem"
	FROM "OITM" Items
	JOIN
	(
		SELECT 
			BusinessPartner."CardCode", 
			DiscountGroup."CardGroup",
			DiscountGroup."ItemGroup", 
			DiscountGroup."Discount",
			DiscountGroup."GroupType",
			DiscountGroup."ObjType",
			BusinessPartner."DiscRel",
			DiscountGroup."DiscRel" as "DiscRelIten"
		FROM "OCRD" BusinessPartner
		JOIN "CLVS_D_MLT_SLT_DISCGROUP" DiscountGroup 
				ON CAST(DiscountGroup."CardGroup"  AS NVARCHAR(100)) = CAST(BusinessPartner."CardCode" AS NVARCHAR(100))
				OR CAST(DiscountGroup."CardGroup"  AS NVARCHAR(100)) = CAST(BusinessPartner."GroupCode" AS NVARCHAR(100))
				OR CAST(DiscountGroup."CardGroup"  AS NVARCHAR(100)) =CAST(0 AS NVARCHAR(100))
	) AS DiscountGroupItem 
	ON (
		DiscountGroupItem."ItemGroup" IS NULL
		OR CAST(DiscountGroupItem."ItemGroup" AS NVARCHAR(100)) = CAST(Items."ItmsGrpCod" AS NVARCHAR(100)) 
		OR CAST(DiscountGroupItem."ItemGroup" AS NVARCHAR(100)) = CAST(Items."ItemCode" AS NVARCHAR(100)) 
		OR CAST(DiscountGroupItem."ItemGroup" AS NVARCHAR(100)) = CAST(Items."FirmCode" AS NVARCHAR(100)) 
		OR CAST( DiscountGroupItem."ItemGroup" AS NVARCHAR(100)) IN ( select CAST("ItemGroup" AS NVARCHAR(100)) from "CLVS_D_MLT_SLT_ITEMGROUPBYQRYGROUP" WHERE "ItemCode"=Items."ItemCode")
	) WITH READ ONLY;



--55-----------------------------------------------------------55--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_DISCOUNTGROUPITEM_B1SLQuery" ( "ItemCode", "Discount", "CardCode", "GroupType", "ObjType", "ItemGroup", "CardGroup" ) AS SELECT
	 Items."ItemCode" AS "ItemCode",
	 COALESCE(DiscountGroupItem."Discount",
	 0.0) AS "Discount",
	 DiscountGroupItem."CardCode" AS "CardCode",
	 DiscountGroupItem."GroupType",
	 DiscountGroupItem."ObjType",
	 DiscountGroupItem."ItemGroup",
	 DiscountGroupItem."CardGroup" AS "CardGroup" 
FROM "OITM" Items JOIN ( SELECT
	 BusinessPartner."CardCode",
	 DiscountGroup."CardGroup",
	 DiscountGroup."ItemGroup",
	 DiscountGroup."Discount",
	 DiscountGroup."GroupType",
	 DiscountGroup."ObjType" 
	FROM "OCRD" BusinessPartner JOIN "CLVS_D_MLT_SLT_DISCGROUP" DiscountGroup ON CAST(DiscountGroup."CardGroup" AS NVARCHAR(100)) = CAST(BusinessPartner."CardCode" AS NVARCHAR(100)) 
	OR CAST(DiscountGroup."CardGroup" AS NVARCHAR(100)) = CAST(BusinessPartner."GroupCode" AS NVARCHAR(100)) 
	OR CAST(DiscountGroup."CardGroup" AS NVARCHAR(100)) = CAST(0 AS NVARCHAR(100)) ) AS DiscountGroupItem ON ( DiscountGroupItem."ItemGroup" IS NULL 
	OR CAST(DiscountGroupItem."ItemGroup" AS NVARCHAR(100)) = CAST(Items."ItmsGrpCod" AS NVARCHAR(100)) 
	OR CAST(DiscountGroupItem."ItemGroup" AS NVARCHAR(100)) = CAST(Items."ItemCode" AS NVARCHAR(100)) 
	OR CAST(DiscountGroupItem."ItemGroup" AS NVARCHAR(100)) = CAST(Items."FirmCode" AS NVARCHAR(100)) 
	OR CAST(DiscountGroupItem."ItemGroup" AS NVARCHAR(100)) = (SELECT
	 TOP 1 CAST("ItemGroup" AS NVARCHAR(100)) 
		FROM "CLVS_D_MLT_SLT_ITEMGROUPBYQRYGROUP") ) WITH READ ONLY;



--56-----------------------------------------------------------56--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_DISTRIBUTIONRULE_B1SLQUERY" ( "OcrCode", "OcrName", "OcrTotal", "Direct", "Locked", "DataSource", "UserSign", "DimCode", "AbsEntry", "Active", "LogInstanc", "UserSign2", "UpdateDate", "IsFixedAmt" ) AS SELECT
	 "OcrCode",
	 "OcrName",
	 "OcrTotal",
	 "Direct",
	 "Locked",
	 "DataSource",
	 "UserSign",
	 "DimCode",
	 "AbsEntry",
	 "Active",
	 "logInstanc" As "LogInstanc",
	 "UserSign2",
	 "updateDate" AS "UpdateDate",
	 "IsFixedAmt" 
FROM OOCR;



--57-----------------------------------------------------------57--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_DRAFTROWS_B1SLQuery" ( "DocEntry", "LineNum", "LineTotal", "ItemCode", "ItemDescription", "UnitPrice", "Currency", "Quantity", "DiscountPercent", "TaxCode", "TaxRate", "WarehouseCode", "WhsName", "CostingCode", "BaseType", "BaseEntry", "BaseLine", "LineStatus", "InventoryItem", "OnHand", "ItemGroupCode", "LastPurchasePrice", "LastPurchasePriceFC", "ItemClass", "UomEntry", "ManSerNum", "ManBtchNum", "TreeType", "FatherCode", "TaxOnly", "HideComp", "VATLiable" ) AS SELECT
	 DISTINCT "DraftRows"."DocEntry" AS "DocEntry",
	 "DraftRows"."LineNum" AS "LineNum",
	 "DraftRows"."LineTotal" AS "LineTotal",
	 "DraftRows"."ItemCode" AS "ItemCode",
	 "DraftRows"."Dscription" AS "ItemDescription",
	 "DraftRows"."PriceBefDi" AS "UnitPrice",
	 "DraftRows"."Currency",
	 "DraftRows"."Quantity" AS "Quantity",
	 COALESCE("DraftRows"."DiscPrcnt",
	 0) AS "DiscountPercent",
	 "DraftRows"."TaxCode" AS "TaxCode",
	 "DraftRows"."VatPrcnt" AS "TaxRate",
	 "DraftRows"."WhsCode" AS "WarehouseCode",
	 "Warehouse"."WhsName" AS "WhsName",
	 "DraftRows"."OcrCode" AS "CostingCode",
	 "DraftRows"."BaseType" AS "BaseType",
	 "DraftRows"."BaseEntry" AS "BaseEntry",
	 "DraftRows"."LineNum" AS "BaseLine",
	 "DraftRows"."LineStatus",
	 "Item"."InvntItem" AS "InventoryItem",
	 CASE WHEN "IT"."OnHand" > 0 
THEN TO_DECIMAL("IT"."OnHand",
	 18,
	 2) 
ELSE 0 
END AS "OnHand",
	 CAST("Item"."ItmsGrpCod" AS INT) AS "ItemGroupCode",
	 TO_DECIMAL((SELECT
	 "SIT"."AvgPrice" 
		FROM "OITW" AS "SIT" 
		WHERE "SIT"."ItemCode" = "Item"."ItemCode" 
		AND "SIT"."WhsCode" = "DraftRows"."WhsCode"),
	 18,
	 2) AS "LastPurchasePrice",
	 -1 AS "LastPurchasePriceFC",
	 (SELECT
	 "T1"."ItemClass" 
	FROM "OITB" AS "T1" 
	WHERE "Item"."ItmsGrpCod" = "T1"."ItmsGrpCod") AS "ItemClass",
	 "DraftRows"."UomEntry",
	 "Item"."ManSerNum" AS "ManSerNum",
	 "Item"."ManBtchNum" AS "ManBtchNum",
	 CASE "DraftRows"."TreeType" WHEN 'N' 
THEN 'iNotATree' WHEN 'S' 
THEN 'iSalesTree' WHEN 'I' 
THEN 'iIngredient' 
ELSE '' 
END AS "TreeType",
	 COALESCE("billMat"."Father",
	 '') AS "FatherCode",
	 "DraftRows"."TaxOnly" AS "TaxOnly",
	 OIT."HideComp" AS "HideComp",
	 (CAST(
			CASE 
				WHEN "DraftRows"."TaxStatus" = 'Y' THEN 1
				ELSE 0
			END AS INT)
		)AS "VATLiable" 
FROM "DRF1" AS "DraftRows" 
INNER JOIN "OITM" AS "Item" ON "DraftRows"."ItemCode" = "Item"."ItemCode" 
INNER JOIN "OITW" AS "IT" ON "IT"."ItemCode" = "Item"."ItemCode" 
AND "IT"."WhsCode" = "DraftRows"."WhsCode" 
INNER JOIN "OWHS" AS "Warehouse" ON "IT"."WhsCode" = "Warehouse"."WhsCode" 
AND "DraftRows"."WhsCode" = "Warehouse"."WhsCode" 
LEFT JOIN "ITT1" AS "billMat" ON "DraftRows"."ItemCode" = "billMat"."Father" 
LEFT JOIN "OITT" AS OIT ON OIT."Code"="Item"."ItemCode" WITH READ ONLY;



--58-----------------------------------------------------------58--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_DRAFTS_B1SLQuery" ( "DocEntry", "DocNum", "CardCode", "CardName", "SalesPersonCode", "TaxDate", "DocDueDate", "DocDate", "DocDateOrder", "DocDateFilter", "DocCurrency", "PaymentGroupCode", "PriceList", "Series", "Comments", "DocStatus", "DocTotal", "CardNameDefault", "CardCodeDefault", "SlpCodeDefault", "DocNumDefault", "DocStatusDefault", "CurrencyDefault", "Email", "IdType", "Identification", "TipoDocE", "ReserveInvoice", "ObjType", "Status", "U_EMA_Approval_Status", "Approval_Status", "DocumentKey" ) AS SELECT
	 Draft."DocEntry" AS "DocEntry",
	 Draft."DocNum" AS "DocNum",
	 Draft."CardCode" AS "CardCode",
	 Draft."CardName" AS "CardName",
	 Draft."SlpCode" AS "SalesPersonCode",
	 CAST(Draft."TaxDate" AS DATE) AS "TaxDate",
	 CAST(Draft."DocDueDate" AS DATE) AS "DocDueDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime",
	 "DocDate") AS "DocDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime",
	 "DocDate") AS "DocDateOrder",
	 CAST(Draft."DocDate" AS DATE) AS "DocDateFilter",
	 Draft."DocCur" AS "DocCurrency",
	 Draft."GroupNum" AS "PaymentGroupCode",
	 COALESCE(Draft."U_ListNum",
	 0) AS "PriceList",
	 Draft."Series" AS "Series",
	 Draft."Comments" AS "Comments",
	 Draft."DocStatus" AS "DocStatus",
	 CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY(Draft."DocCur") = 1 
THEN Draft."DocTotal" 
ELSE Draft."DocTotalFC" 
END AS "DocTotal",
	 '' AS "CardNameDefault",
	 '' AS "CardCodeDefault",
	 0 AS "SlpCodeDefault",
	 0 AS "DocNumDefault",
	 'ALL' AS "DocStatusDefault",
	 'ALL' AS "CurrencyDefault",
	 COALESCE(Draft."U_CorreoFE",
	 '') AS "Email",
	 COALESCE(Draft."U_TipoIdentificacion",
	 '') AS "IdType",
	 COALESCE(Draft."U_NumIdentFE",
	 '') AS "Identification",
	 COALESCE(Draft."U_TipoDocE",
	 '') AS "TipoDocE",
	 COALESCE(Draft."isIns",
	 'N') AS "ReserveInvoice",
	 Draft."ObjType",
	 Approval."Status",
	 Draft."U_EMA_Approval_Status",
	 CASE WHEN Draft."U_EMA_Approval_Status" IS NOT NULL 
THEN CASE WHEN Draft."U_EMA_Approval_Status" = 'arsApproved' 
THEN 'Aprobado' WHEN Draft."U_EMA_Approval_Status" = 'arsNotApproved' 
THEN 'Rechazado' WHEN Draft."U_EMA_Approval_Status" = 'arsPending' 
THEN 'Pendiente' 
ELSE 'N/A' 
END 
ELSE Approval."Approval_Status" 
END AS "Approval_Status",
	 "U_DocumentKey" AS "DocumentKey" 
FROM "ODRF" AS Draft 
LEFT JOIN "CLVS_D_MLT_SLT_STATUSAPPROVALDOCUMENT" AS Approval ON Draft."DocEntry" = Approval."DraftEntry" WITH READ ONLY;



--59-----------------------------------------------------------59--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_DRAFT_B1SLQuery" ( "DocEntry", "DocNum", "CardCode", "CardName", "SalesPersonCode", "DocDate", "DocDateOrder", "DocDateFilter", "DocDueDate", "TaxDate", "DocCurrency", "ReserveInvoice", "PaymentGroupCode", "Series", "PriceList", "Comments", "DocTotal", "DocStatus", "IdTranRedimir", "IdTranAcumular", "CardNameDefault", "CardCodeDefault", "SlpCodeDefault", "DocNumDefault", "InvoiceNumber", "DocStatusDefault", "Email", "IdType", "Identification", "TipoDocE", "ConfirmationEntry", "AttachmentEntry", "ObjType", "Approval_Status" ) AS SELECT
	 "DRF"."DocEntry" AS "DocEntry",
	 "DRF"."DocNum" AS "DocNum",
	 "DRF"."CardCode" AS "CardCode",
	 "DRF"."CardName" AS "CardName",
	 "DRF"."SlpCode" AS "SalesPersonCode",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DRF"."DocTime", "DRF"."DocDate") AS "DocDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DRF"."DocTime", "DRF"."DocDate") AS "DocDateOrder",
	 CAST("DRF"."DocDate" AS DATE) AS "DocDateFilter",
	 CAST(DRF."DocDueDate" AS DATE) AS "DocDueDate",
	 CAST(DRF."TaxDate" AS DATE) AS "TaxDate",
	 "DRF"."DocCur" AS "DocCurrency",
	 COALESCE("DRF"."isIns",
	 'N') AS "ReserveInvoice",
	 "DRF"."GroupNum" AS "PaymentGroupCode",
	 "DRF"."Series" AS "Series",
	 COALESCE("DRF"."U_ListNum",
	 0) AS "PriceList",
	 "DRF"."Comments" AS "Comments",
	 (CASE WHEN "CLVS_D_MLT_SLT_ISLOCALCURRENCY"("DRF"."DocCur") = 1 
	THEN "DRF"."DocTotal" 
	ELSE "DRF"."DocTotalFC" 
	END) AS "DocTotal",
	 "DRF"."DocStatus" AS "DocStatus",
	 '' AS "IdTranRedimir",
	 '' AS "IdTranAcumular",
	 '' AS "CardNameDefault",
	 '' AS "CardCodeDefault",
	 0 AS "SlpCodeDefault",
	 0 AS "DocNumDefault",
	 "DRF"."U_DocumentKey" AS "InvoiceNumber",
	 'ALL' AS "DocStatusDefault",
	 IFNULL("DRF"."U_CorreoFE",
	 '') AS "Email",
	 IFNULL("DRF"."U_TipoIdentificacion",
	 '') AS "IdType",
	 IFNULL("DRF"."U_NumIdentFE",
	 '') AS "Identification",
	 IFNULL("DRF"."U_TipoDocE",
	 '') AS "TipoDocE",
	 COALESCE("WDD"."WddCode",
	 "DRF"."DocEntry") AS "ConfirmationEntry",
	 "DRF"."AtcEntry" AS "AttachmentEntry",
	 "DRF"."ObjType",
	 (CASE WHEN "DRF"."U_EMA_Approval_Status" IS NULL 
	THEN CASE "WDD"."Status" WHEN 'Y' 
	THEN 'arsApproved' WHEN 'W' 
	THEN 'arsPending' WHEN 'N' 
	THEN 'arsNotApproved' 
	ELSE NULL 
	END 
	ELSE "DRF"."U_EMA_Approval_Status" 
	END) AS "Approval_Status" 
FROM "ODRF" AS "DRF" 
LEFT JOIN "OWDD" AS "WDD" ON "WDD"."DraftEntry" = "DRF"."DocEntry" WITH READ ONLY;



--60-----------------------------------------------------------60--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_EXISTSBCDCODE_B1SLQuery" ( "AbsEntry", "Barcode", "FreeText" ) AS SELECT
    "BcdEntry" AS "AbsEntry",
    "BcdCode" AS "Barcode",
    "BcdName" AS "FreeText"
FROM "OBCD";



--61-----------------------------------------------------------61--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_GETANEXOS_B1SLQuery" ( "AbsoluteEntry", "LineNum", "SourcePath", "FileName", "FileExtension", "AttachmentDate", "Override", "FreeText" ) AS SELECT
	 "Attachment"."AbsEntry" AS "AbsoluteEntry",
	 "Attachment"."Line" AS "LineNum",
	 "Attachment"."srcPath" AS "SourcePath",
	 "Attachment"."FileName" AS "FileName",
	 "Attachment"."FileExt" AS "FileExtension",
	 CAST("Attachment"."Date" AS DATE) AS "AttachmentDate",
	 CASE "Attachment"."Override" WHEN 'Y' 
THEN 'tYES' 
ELSE 'tNO' 
END AS "Override",
	 "Attachment"."FreeText" AS "FreeText" 
FROM "ATC1" AS "Attachment" WITH READ ONLY;



--62-----------------------------------------------------------62--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_GETBATCHES_B1SLQuery" ( "SysNumber", "DistNumber", "Stock", "CommitQty", "Disponible", "AbsEntry", "BinCode", "OnHandQty", "LotesItemCode", "BatchQtyItemCode", "ItemBinAccumulatorWhsCode", "BatchQtyWhsCode" ) AS SELECT
    "Lotes"."SysNumber",
    "Lotes"."DistNumber",
    COALESCE(CAST("BatchQty"."Quantity" AS DECIMAL(18,2)), 0) AS "Stock",
    COALESCE(CAST("CommitQty" AS DECIMAL(18,2)), 0) AS "CommitQty",
    COALESCE(CAST("BatchQty"."Quantity" - "CommitQty" AS DECIMAL(18,2)), 0) AS "Disponible",
    COALESCE("Ubicaciones"."AbsEntry", 0) AS "AbsEntry",
    "Ubicaciones"."BinCode",
    COALESCE(CAST("ItemBinAccumulator"."OnHandQty" AS DECIMAL(18,2)), 0) AS "OnHandQty",
    "Lotes"."ItemCode" AS "LotesItemCode",
    "BatchQty"."ItemCode" AS "BatchQtyItemCode",
    "ItemBinAccumulator"."WhsCode" AS "ItemBinAccumulatorWhsCode",
    "BatchQty"."WhsCode" AS "BatchQtyWhsCode"
FROM "OBTN" AS "Lotes"
INNER JOIN "OBTQ" AS "BatchQty" ON "Lotes"."AbsEntry" = "BatchQty"."MdAbsEntry"
LEFT JOIN "OBBQ" AS "ItemBinAccumulator" ON "Lotes"."AbsEntry" = "ItemBinAccumulator"."SnBMDAbs"
LEFT JOIN "OBIN" AS "Ubicaciones" ON "ItemBinAccumulator"."BinAbs" = "Ubicaciones"."AbsEntry" WITH READ ONLY;



--63-----------------------------------------------------------63--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_GETEXCHANGERATE_B1SLQuery" ( "Rate" ) AS SELECT
    CAST("Rate" AS DECIMAL(10,2)) AS "Rate"
FROM "ORTT"
WHERE TO_DATE("RateDate") = CURRENT_DATE
AND "CLVS_D_MLT_SLT_ISLOCALCURRENCY"("Currency") = 0;



--64-----------------------------------------------------------64--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_GETITEMSFORTRANSFER_B1SLQuery" ( "ItemCode", "ItemName", "FilterUpperCase", "Barcode", "ManBtchNum", "ManSerNum", "SysNumber", "DistNumber", "Stock", "IWWhsCode", "UWhsCode", "SWhsCode", "BinAbs", "BinAbsDefault", "UWhsCodeDefault" ) AS SELECT
	 DISTINCT Items."ItemCode",
	 Items."ItemName",
	 UPPER(CONCAT(Items."ItemCode", CONCAT(' ', Items."ItemName"))) AS "FilterUpperCase",
	 Items."CodeBars" AS "Barcode",
	 Items."ManBtchNum",
	 Items."ManSerNum",
	 COALESCE(Series."SysNumber",
	 0) AS "SysNumber",
	 COALESCE(Series."DistNumber",
	 '') AS "DistNumber",
	 CASE WHEN Items."ManSerNum" = 'Y' 
THEN COALESCE(Series."Qty",
	 0) WHEN Ubicaciones."WhsCode" IS NULL 
THEN COALESCE((ItemsWarehouse."OnHand" - ItemsWarehouse."OnOrder"),
	 0) 
ELSE Ubicaciones."OnHandQty" 
END AS "Stock",
	 ItemsWarehouse."WhsCode" AS "IWWhsCode",
	 Ubicaciones."WhsCode" AS "UWhsCode",
	 Series."WhsCode" AS "SWhsCode",
	 Ubicaciones."BinAbs",
	 0 AS "BinAbsDefault",
	 '' AS "UWhsCodeDefault" 
FROM "OITM" AS Items 
INNER JOIN "OITW" AS ItemsWarehouse ON Items."ItemCode" = ItemsWarehouse."ItemCode" 
AND (ItemsWarehouse."OnHand" - ItemsWarehouse."OnOrder") > 0 
AND Items."InvntItem" = 'Y' 
AND Items."frozenFor" = 'N' 
LEFT JOIN "CLVS_D_MLT_SLT_GETLOCATIONFORTRANSFER" AS Ubicaciones ON Items."ItemCode" = Ubicaciones."ItemCode" 
AND ItemsWarehouse."WhsCode" = Ubicaciones."WhsCode" 
LEFT JOIN "CLVS_D_MLT_SLT_GETSERIESFORTRANSFER" AS Series ON Items."ItemCode" = Series."ItemCode" 
AND ItemsWarehouse."WhsCode" = Series."WhsCode" WITH READ ONLY;



--65-----------------------------------------------------------65--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_GETLOCATIONFORTRANSFER" ( "ItemCode", "BinAbs", "OnHandQty", "ManBin", "WhsCode" ) AS SELECT
    "ItemCode",
    "BinAbs",
    "OnHandQty",
    'Y' AS "ManBin",
    "WhsCode"
FROM
    "OIBQ" AS ItemBin
WHERE
    "OnHandQty" > 0;



--66-----------------------------------------------------------66--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_GETLOCATION_B1SLQuery" ( "AbsEntry", "BinCode", "FilterUpperCase", "WhsCode" ) AS SELECT
	 "AbsEntry",
	 "BinCode",
	 UPPER( "BinCode") AS "FilterUpperCase",
	 "WhsCode" 
FROM "OBIN";



--67-----------------------------------------------------------67--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_GETLOTESTRANSTOCK_B1SLQuery" ( "SysNumber", "DistNumber", "Disponible", "ItemCode", "BQWhsCode", "BBAWhsCode", "BinAbs" ) AS SELECT
	 Batch."SysNumber",
	 Batch."DistNumber",
	 COALESCE(CAST(COALESCE(BatchBinAcumulator."OnHandQty",(BatchQty."Quantity" - BatchQty."CommitQty") ) AS DECIMAL(18,2)),
	 0) AS "Disponible",
	 Batch."ItemCode",
	 BatchQty."WhsCode" AS "BQWhsCode",
	 BatchBinAcumulator."WhsCode" AS "BBAWhsCode",
	 BatchBinAcumulator."BinAbs" 
FROM "OBTN" Batch 
INNER JOIN "OBTQ" BatchQty ON Batch."AbsEntry" = BatchQty."MdAbsEntry" 
AND (BatchQty."Quantity" - COALESCE(BatchQty."CommitQty",
	 0)) > 0 
LEFT JOIN "OBBQ" BatchBinAcumulator ON Batch."AbsEntry" = BatchBinAcumulator."SnBMDAbs" WITH READ ONLY;



--68-----------------------------------------------------------68--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_GETONHANDSERIES_B1SLQuery" ( "ItemCode", "WhsCode", "OnHand" ) AS SELECT
    "ItemCode",
    "WhsCode",
    SUM(COALESCE("OnHandQty", 0)) AS "OnHand"
FROM "OSBQ"
GROUP BY "WhsCode", "ItemCode" WITH READ ONLY;



--69-----------------------------------------------------------69--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_GETPRICELIST_B1SLQuery" ( "ListNum", "ListName", "Currency" ) AS SELECT
	 "ListNum" AS "ListNum",
	 "ListName" AS "ListName",
	 "PrimCurr" AS "Currency" 
FROM "OPLN"
WHERE "ValidFor" = 'Y';



--70-----------------------------------------------------------70--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_GETSERIESBYWHSCODE" ( "SysNumber", "DistNumber", "BinCode", "Quantity", "ItemCode", "SQWhsCode", "IBAWhsCode" ) AS SELECT
    SerialNumber."SysNumber",
    SerialNumber."DistNumber",
    BinLocation."BinCode",
    (SerialNoQuantities."Quantity" - SerialNoQuantities."CommitQty") AS "Quantity",
    SerialNumber."ItemCode",
    SerialNoQuantities."WhsCode" AS "SQWhsCode",
    ItemSerialBatchBinAccumulator."WhsCode" AS "IBAWhsCode"
FROM
    OSRN SerialNumber
INNER JOIN
    OSRQ SerialNoQuantities
ON
    SerialNumber."SysNumber" = SerialNoQuantities."SysNumber"
    AND SerialNumber."ItemCode" = SerialNoQuantities."ItemCode"
    AND (SerialNoQuantities."Quantity" - SerialNoQuantities."CommitQty") > 0
LEFT JOIN
    OSBQ ItemSerialBatchBinAccumulator
ON
    SerialNoQuantities."AbsEntry" = ItemSerialBatchBinAccumulator."SnBMDAbs"
    AND ItemSerialBatchBinAccumulator."OnHandQty" > 0
LEFT JOIN
    OBIN BinLocation
ON
    ItemSerialBatchBinAccumulator."BinAbs" = BinLocation."AbsEntry" WITH READ ONLY;



--71-----------------------------------------------------------71--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_GETSERIESFORLIST_B1SLQuery" ( "SystemSerialNumber", "DistNumber", "ItemCode", "WhsCode", "Quantity" ) AS SELECT
	 "OSRN"."SysNumber" AS "SystemSerialNumber",
	 "OSRN"."DistNumber",
	 "OSRN"."ItemCode",
	 "SerialNoQuantities"."WhsCode" AS "WhsCode",
	 "SerialNoQuantities"."Quantity" AS "Quantity" 
FROM "OSRN"
        INNER JOIN "OSRQ" "SerialNoQuantities" 
	    ON "OSRN"."SysNumber" = "SerialNoQuantities"."SysNumber"
	    AND "OSRN"."ItemCode" = "SerialNoQuantities"."ItemCode"
	    AND ("SerialNoQuantities"."Quantity" - "SerialNoQuantities"."CommitQty") > 0
        LEFT JOIN "OSBQ" "ItemSerialBatchBinAccumulator" 
	    ON "SerialNoQuantities"."AbsEntry" = "ItemSerialBatchBinAccumulator"."SnBMDAbs"
	    AND "ItemSerialBatchBinAccumulator"."OnHandQty" > 0
        LEFT JOIN "OBIN" "BinLocation" 
        ON "ItemSerialBatchBinAccumulator"."BinAbs" = "BinLocation"."AbsEntry" WITH READ ONLY;



--72-----------------------------------------------------------72--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_GETSERIESFORTRANSFER" ( "SysNumber", "DistNumber", "ItemCode", "WhsCode", "Qty" ) AS SELECT
    SerialNumbers."SysNumber",
    SerialNumbers."DistNumber",
    SerialNumbers."ItemCode",
    SeriesQty."WhsCode",
    (SeriesQty."Quantity" - SeriesQty."CommitQty") AS "Qty"
FROM "OSRN" SerialNumbers
INNER JOIN "OSRQ" SeriesQty
    ON SerialNumbers."AbsEntry" = SeriesQty."MdAbsEntry"
    AND (SeriesQty."Quantity" - SeriesQty."CommitQty") > 0 WITH READ ONLY;



--73-----------------------------------------------------------73--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_GETSERIES_B1SLQuery" ( "ObjectCode", "Serie", "SerieName" ) AS ((SELECT
	 CASE "DocSubType" WHEN 'S' 
		THEN '-2' WHEN 'C' 
		THEN '2' 
		ELSE --ESTA PARTE ESTA VALIDANDO QUE SEA UN ENTERO, ESTO SE DEBE ELIMINAR CUANDO CAMBIEN EN EMA LA PROPIEDAD PARA QUE SEA VARCHAR
 CASE LENGTH(LTRIM("ObjectCode",
	 '+-.0123456789')) WHEN 0 
		THEN "ObjectCode" 
		ELSE '0' 
		END 
		END AS "ObjectCode",
	 "Series" AS "Serie",
	 "SeriesName" AS "SerieName" 
		FROM "NNM1" 
		WHERE "ObjectCode" != 'APROVCRM') UNION ALL (SELECT
	 '-13' AS "ObjectCode",
	 "Series" AS "Serie",
	 "SeriesName" AS "SerieName" 
		FROM "NNM1" 
		WHERE "ObjectCode" != 'APROVCRM' 
		AND "ObjectCode" = '13')) WITH READ ONLY;



--74-----------------------------------------------------------74--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_GETUNIQUEID_B1SLQuery" ( "U_DocumentKey", "DocEntry", "DocNum", "Table" ) AS ((((((((((((((((((SELECT
	 "U_DocumentKey",
	 "DocEntry",
	 "DocNum",
	 'OINV' AS "Table" 
																	FROM "OINV") UNION ALL (SELECT
	 "U_DocumentKey",
	 "DocEntry",
	 "DocNum",
	 'ORDR' AS "Table" 
																	FROM "ORDR")) UNION ALL (SELECT
	 "U_DocumentKey",
	 "DocEntry",
	 "DocNum",
	 'OQUT' AS "Table" 
																FROM "OQUT")) UNION ALL (SELECT
	 "U_DocumentKey",
	 "DocEntry",
	 "DocNum",
	 'OPDN' AS "Table" 
															FROM "OPDN")) UNION ALL (SELECT
	 "U_DocumentKey",
	 "DocEntry",
	 "DocNum",
	 'ORPD' AS "Table" 
														FROM "ORPD")) UNION ALL (SELECT
	 "U_DocumentKey",
	 "DocEntry",
	 "DocNum",
	 'ORIN' AS "Table" 
													FROM "ORIN")) UNION ALL (SELECT
	 "U_DocumentKey",
	 "DocEntry",
	 "DocNum",
	 'OPOR' AS "Table" 
												FROM "OPOR")) UNION ALL (SELECT
	 "U_DocumentKey",
	 "DocEntry",
	 "DocNum",
	 'OPCH' AS "Table" 
											FROM "OPCH")) UNION ALL (SELECT
	 "U_DocumentKey",
	 "DocEntry",
	 "DocNum",
	 'OIGN' AS "Table" 
										FROM "OIGN")) UNION ALL (SELECT
	 "U_DocumentKey",
	 "DocEntry",
	 "DocNum",
	 'OIGE' AS "Table" 
									FROM "OIGE")) UNION ALL (SELECT
	 "U_DocumentKey",
	 "DocEntry",
	 "DocNum",
	 'OWTQ' AS "Table" 
								FROM "OWTQ")) UNION ALL (SELECT
	 "U_DocumentKey",
	 "DocEntry",
	 "DocNum",
	 'OWTR' AS "Table" 
							FROM "OWTR")) UNION ALL (SELECT
	 "U_DocumentKey",
	 "DocEntry",
	 "DocNum",
	 'ORCT' AS "Table" 
						FROM "ORCT")) UNION ALL (SELECT
	 "U_DocumentKey",
	 "DocEntry",
	 "DocNum",
	 'OVPM' AS "Table" 
					FROM "OVPM")) UNION ALL (SELECT
	 "U_DocumentKey",
	 "DocEntry",
	 "DocNum",
	 'ODPI' AS "Table" 
				FROM "ODPI")) UNION ALL (SELECT
	 "U_DocumentKey",
	 "DocEntry",
	 "DocNum",
	 'ODLN' AS "Table" 
			FROM "ODLN")) UNION ALL (SELECT
	 "U_DocumentKey",
	 "DocEntry",
	 "DocNum",
	 'ODRF' AS "Table" 
		FROM "ODRF")) UNION ALL (SELECT
	 "U_DocumentKey",
	 "DocEntry",
	 "DocNum",
	 'ODPO' AS "Table" 
		FROM "ODPO")) WITH READ ONLY;



--75-----------------------------------------------------------75--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_GETWAREHOUSES_B1SLQuery" ( "WhsCode", "WhsName", "FilterUpperCase", "BinActivat", "Inactive" ) AS SELECT
	 "WhsCode" AS "WhsCode",
	 "WhsName" AS "WhsName",
	 UPPER(CONCAT("WhsCode", CONCAT(' ', "WhsName"))) AS "FilterUpperCase",
	 "BinActivat",
	 "Inactive" 
FROM "OWHS";



--76-----------------------------------------------------------76--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_GOODSRECEIPTROWS_B1SLQuery" ( "LineNum", "LineStatus", "DocEntry", "ItemCode", "ItemDescription", "UnitPrice", "Quantity", "DiscountPercent", "WarehouseCode", "TaxCode", "TaxRate", "UoMEntry", "TaxOnly", "WhsName", "Currency", "VATLiable" ) AS SELECT
	 GoodReceiptsRows."LineNum",
	 GoodReceiptsRows."LineStatus",
	 GoodReceiptsRows."DocEntry",
	 GoodReceiptsRows."ItemCode",
	 GoodReceiptsRows."Dscription" AS "ItemDescription",
	 COALESCE(GoodReceiptsRows."PriceBefDi",
	 0) AS "UnitPrice",
	 GoodReceiptsRows."Quantity",
	 COALESCE(GoodReceiptsRows."DiscPrcnt",
	 0) AS "DiscountPercent",
	 GoodReceiptsRows."WhsCode" AS "WarehouseCode",
	 GoodReceiptsRows."TaxCode",
	 CLVS_D_MLT_SLT_TAXRATE(GoodReceiptsRows."TaxCode") AS "TaxRate",
	 GoodReceiptsRows."UomEntry" AS "UoMEntry",
	 GoodReceiptsRows."TaxOnly",
	 Warehouse."WhsName",
	 GoodReceiptsRows."Currency",
	 (CAST(
			CASE 
				WHEN GoodReceiptsRows."TaxStatus" = 'Y' THEN 1
				ELSE 0
			END AS INT)
		)AS "VATLiable" 
FROM "PDN1" AS GoodReceiptsRows 
LEFT JOIN "OWHS" AS Warehouse ON GoodReceiptsRows."WhsCode" = Warehouse."WhsCode" WITH READ ONLY;



--77-----------------------------------------------------------77--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_GOODSRECEIPT_B1SLQuery" ( "DocEntry", "DocNum", "CardCode", "CardName", "Comments", "SalesPersonCode", "TaxDate", "DocDueDate", "DocDate", "DocDateOrder", "DocDateFilter", "PriceList", "DocTotal", "DocCurrency", "DocStatus", "DocStatusDefault", "CardCodeDefault", "CardNameDefault", "SlpCodeDefault", "DocNumDefault", "AttachmentEntry" ) AS SELECT
	 "DocEntry",
	 "DocNum",
	 "CardCode",
	 "CardName",
	 "Comments",
	 "SlpCode" AS "SalesPersonCode",
	 CAST("TaxDate" AS DATE) AS "TaxDate",
	 CAST("DocDueDate" AS DATE) AS "DocDueDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime",
	 "DocDate") AS "DocDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime", "DocDate") AS "DocDateOrder",
	 "DocDate" AS "DocDateFilter",
	 COALESCE("U_ListNum",
	 0) AS "PriceList",
	 CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY("DocCur") = 1 
THEN "DocTotal" 
ELSE "DocTotalFC" 
END AS "DocTotal",
	 "DocCur" AS "DocCurrency",
	 "DocStatus",
	 'ALL' AS "DocStatusDefault",
	 '' AS "CardCodeDefault",
	 '' AS "CardNameDefault",
	 0 AS "SlpCodeDefault",
	 0 AS "DocNumDefault" ,
	 "AtcEntry" AS "AttachmentEntry" 
FROM "OPDN";



--78-----------------------------------------------------------78--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_INCOMINGPAYMENT_B1SLQuery" ( "DocEntry", "CashSum", "CashSumFC", "TrsfrSum", "TrsfrSumFC" ) AS SELECT
    "DocEntry",
    "CashSum",
    "CashSumFC",
    "TrsfrSum",
    "TrsfrSumFC"
FROM "ORCT";



--79-----------------------------------------------------------79--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_INCOMINGPAY_B1SLQuery" ( "DocNum", "DocEntry", "CardName", "Comments", "DocDate", "DocDateOrder", "DocNumDefault" ) AS SELECT
	 "DocNum",
	 "DocEntry",
	 "CardName",
	 "Comments",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime", "DocDate") AS "DocDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime", "DocDate") AS "DocDateOrder",
	 0 AS "DocNumDefault" 
FROM "ORCT" WITH READ ONLY;



--80-----------------------------------------------------------80--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_INPUTINVENTORY_B1SLQuery" ( "DocNum", "DocEntry", "CardName", "Comments", "DocDate", "DocDateOrder", "DocNumDefault" ) AS SELECT
	 "DocNum",
	 "DocEntry",
	 "CardName",
	 "Comments",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime", "DocDate") AS "DocDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime", "DocDate") AS "DocDateOrder",
	 0 AS "DocNumDefault" 
FROM "OIGN" WITH READ ONLY;



--81-----------------------------------------------------------81--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_INVENTORY_ENTRY_B1SLQuery" ( "DocEntry", "DocNum", "CardName", "DocDate", "DocDateOrder", "DocDateFilter", "DocStatus", "SlpCode", "SlpName", "Comments", "DocStatusDefault", "SlpCodeDefault", "DocNumDefault" ) AS SELECT
	 TransferReq."DocEntry",
	 TransferReq."DocNum",
	 TransferReq."CardName",
	 CLVS_D_MLT_SLT_DOCFULLDATE(TransferReq."DocTime", TransferReq."DocDate") AS "DocDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE(TransferReq."DocTime", TransferReq."DocDate") AS "DocDateOrder",
	 CAST(TransferReq."DocDate" AS DATE) AS "DocDateFilter",
	 TransferReq."DocStatus",
	 SalesPerson."SlpCode",
	 SalesPerson."SlpName",
	 TransferReq."Comments",
	 'ALL' AS "DocStatusDefault",
	 0 AS "SlpCodeDefault",
	 0 AS "DocNumDefault" 
FROM OIGN AS TransferReq 
INNER JOIN OSLP AS SalesPerson ON TransferReq."SlpCode" = SalesPerson."SlpCode" WITH READ ONLY;



--82-----------------------------------------------------------82--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_INVENTORY_EXIT_B1SLQuery" ( "DocEntry", "DocNum", "CardName", "DocDate", "DocDateOrder", "DocDateFilter", "DocStatus", "SlpCode", "SlpName", "Comments", "DocStatusDefault", "SlpCodeDefault", "DocNumDefault" ) AS SELECT
	 TransferReq."DocEntry",
	 TransferReq."DocNum",
	 TransferReq."CardName",
	 CLVS_D_MLT_SLT_DOCFULLDATE(TransferReq."DocTime", TransferReq."DocDate") AS "DocDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE(TransferReq."DocTime", TransferReq."DocDate") AS "DocDateOrder",
	 CAST(TransferReq."DocDate" AS DATE) AS "DocDateFilter",
	 TransferReq."DocStatus",
	 SalesPerson."SlpCode",
	 SalesPerson."SlpName",
	 TransferReq."Comments",
	 'ALL' AS "DocStatusDefault",
	 0 AS "SlpCodeDefault",
	 0 AS "DocNumDefault" 
FROM OIGE AS TransferReq 
INNER JOIN OSLP AS SalesPerson ON TransferReq."SlpCode" = SalesPerson."SlpCode" WITH READ ONLY;



--83-----------------------------------------------------------83--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_INVOICEPURCHASE_B1SLQuery" ( "DocEntry", "DocNum", "DocumentType", "CardCode", "CardName", "NumAtCard", "DocCurrency", "Total", "Saldo", "DocDate", "DocDateFilter", "DocDueDate" ) AS ((SELECT
	 "T0"."DocEntry",
	 "T0"."DocNum",
	 'Factura proveedor' AS "DocumentType",
	 "T0"."CardCode",
	 "T0"."CardName",
	 "T0"."NumAtCard",
	 "T0"."DocCur" AS "DocCurrency",
	 CASE WHEN "CLVS_D_MLT_SLT_ISLOCALCURRENCY"("T0"."DocCur") = 1 
		THEN "T0"."DocTotal" 
		ELSE "T0"."DocTotalFC" 
		END AS "Total",
	 CASE WHEN "CLVS_D_MLT_SLT_ISLOCALCURRENCY"("T0"."DocCur") = 1 
		THEN "T0"."DocTotal" - "T0"."PaidToDate" 
		ELSE "T0"."DocTotalFC" - "T0"."PaidFC" 
		END AS "Saldo",
	 CLVS_D_MLT_SLT_DOCFULLDATE("T0"."DocTime", "T0"."DocDate") AS "DocDate",
	 CAST("T0"."DocDate" AS DATE) AS "DocDateFilter",
	 CLVS_D_MLT_SLT_DOCFULLDATE("T0"."DocTime", "T0"."DocDueDate") AS "DocDueDate" 
		FROM "OPCH" AS "T0" 
		WHERE "T0"."DocStatus" = 'O') UNION ALL (SELECT
	 "T1"."DocEntry",
	 "T1"."DocNum",
	 'Factura anticipo' AS "DocumentType",
	 "T1"."CardCode",
	 "T1"."CardName",
	 "T1"."NumAtCard",
	 "T1"."DocCur" AS "DocCurrency",
	 CASE WHEN "CLVS_D_MLT_SLT_ISLOCALCURRENCY"("T1"."DocCur") = 1 
		THEN "T1"."DocTotal" 
		ELSE "T1"."DocTotalFC" 
		END AS "Total",
	 CASE WHEN "CLVS_D_MLT_SLT_ISLOCALCURRENCY"("T1"."DocCur") = 1 
		THEN "T1"."DocTotal" - "T1"."PaidToDate" 
		ELSE "T1"."DocTotalFC" - "T1"."PaidFC" 
		END AS "Saldo",
	 CLVS_D_MLT_SLT_DOCFULLDATE("T1"."DocTime", "T1"."DocDate") AS "DocDate",
	 CAST("T1"."DocDate" AS DATE) AS "DocDateFilter",
	 CLVS_D_MLT_SLT_DOCFULLDATE("T1"."DocTime", "T1"."DocDueDate") AS "DocDueDate" 
		FROM "ODPO" AS "T1" 
		WHERE "T1"."DocStatus" = 'O')) WITH READ ONLY;



--84-----------------------------------------------------------84--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_INVOICE_RECONCILIATION_B1SLQuery" ( "DocEntry", "DocNum", "DocumentType", "CardCode", "CardName", "NumAtCard", "DocCurrency", "DocCurrencyDefault", "DocDate", "DocDueDate", "DocDateFilter", "Total", "TotalUSD", "Saldo", "SaldoUSD", "InstlmntID", "TransId", "ObjType" ) AS SELECT
	 "Invoice"."DocEntry",
	 "Invoice"."DocNum",
	 'Factura' AS "DocumentType",
	 "Invoice"."CardCode",
	 "Invoice"."CardName",
	 "Invoice"."NumAtCard",
	 "Invoice"."DocCur" AS "DocCurrency",
	 '' AS "DocCurrencyDefault",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime",
	 "DocDate") AS "DocDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime",
	 "DocDueDate") AS "DocDueDate",
	 CAST("Invoice"."DocDate" AS DATE) AS "DocDateFilter",
	 COALESCE("ARInvoiceInstallments"."InsTotal",
	 0) AS "Total",
	 COALESCE("ARInvoiceInstallments"."InsTotalFC",
	 0) AS "TotalUSD",
	 COALESCE("ARInvoiceInstallments"."InsTotal" - "ARInvoiceInstallments"."PaidToDate",
	 0) AS "Saldo",
	 COALESCE("ARInvoiceInstallments"."InsTotalFC" - "ARInvoiceInstallments"."PaidFC",
	 0) AS "SaldoUSD",
	 "ARInvoiceInstallments"."InstlmntID",
	 "Invoice"."TransId",
	 "Invoice"."ObjType" 
FROM "OINV" AS "Invoice" 
INNER JOIN "INV6" AS "ARInvoiceInstallments" ON "Invoice"."DocEntry" = "ARInvoiceInstallments"."DocEntry" 
WHERE "Invoice"."DocStatus" = 'O' WITH READ ONLY;



--85-----------------------------------------------------------85--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_INVTRANSFER_B1SLQUERY" ( "DocEntry", "DocNum", "CardName", "DocDate", "DocDateOrder", "Comments", "DocNumDefault" ) AS SELECT
	 InvTransfer."DocEntry",
	 InvTransfer."DocNum",
	 InvTransfer."CardName",
	 CLVS_D_MLT_SLT_DOCFULLDATE(InvTransfer."DocTime",
	 InvTransfer."DocDate") AS "DocDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE(InvTransfer."DocTime",
	 InvTransfer."DocDate") AS "DocDateOrder",
	 InvTransfer."Comments",
	 0 AS "DocNumDefault" 
FROM OWTR AS InvTransfer WITH READ ONLY;



--86-----------------------------------------------------------86--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_ITEMBYITEMXML_B1SLQuery" ( "ItemCode", "ItemDescription", "ItemNameXml" ) AS SELECT
    Items."ItemCode",
    Items."ItemName" AS "ItemDescription",
    T1."U_DescriptionItemXml" AS "ItemNameXml"
FROM "OITM" Items
INNER JOIN "PDN1" T1 ON Items."ItemCode" = T1."ItemCode" WITH READ ONLY;



--87-----------------------------------------------------------87--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_ITEMGROUPBYQRYGROUP" ( "ItemGroup", "ItemCode", "Discount", "CardGroup" ) AS SELECT
	 DiscountGroupItem."ItemGroup",
	 Items."ItemCode",
	 DiscountGroupItem."Discount",
	 DiscountGroupItem."CardGroup" 
FROM "OITM" Items 
INNER JOIN "CLVS_D_MLT_SLT_DISCGROUP" DiscountGroupItem ON DiscountGroupItem."ItemGroup" IN (SELECT
	 TO_NVARCHAR("ItmsTypCod") 
	FROM "OITG") 
AND ( (Items."QryGroup1" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '1') 
	OR (Items."QryGroup2" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '2') 
	OR (Items."QryGroup3" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '3') 
	OR (Items."QryGroup4" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '4') 
	OR (Items."QryGroup5" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '5') 
	OR (Items."QryGroup6" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '6') 
	OR (Items."QryGroup7" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '7') 
	OR (Items."QryGroup8" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '8') 
	OR (Items."QryGroup9" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '9') 
	OR (Items."QryGroup10" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '10') 
	OR (Items."QryGroup11" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '11') 
	OR (Items."QryGroup12" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '12') 
	OR (Items."QryGroup13" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '13') 
	OR (Items."QryGroup14" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '14') 
	OR (Items."QryGroup15" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '15') 
	OR (Items."QryGroup16" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '16') 
	OR (Items."QryGroup17" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '17') 
	OR (Items."QryGroup18" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '18') 
	OR (Items."QryGroup19" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '19') 
	OR (Items."QryGroup20" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '20') 
	OR (Items."QryGroup21" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '21') 
	OR (Items."QryGroup22" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '22') 
	OR (Items."QryGroup23" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '23') 
	OR (Items."QryGroup24" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '24') 
	OR (Items."QryGroup25" = 'Y' 
		AND DiscountGroupItem."ItemGroup"= '25') 
	OR (Items."QryGroup26" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '26') 
	OR (Items."QryGroup27" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '27') 
	OR (Items."QryGroup28" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '28') 
	OR (Items."QryGroup29" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '29') 
	OR (Items."QryGroup30" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '30') 
	OR (Items."QryGroup31" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '31') 
	OR (Items."QryGroup32" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '32') 
	OR (Items."QryGroup33" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '33') 
	OR (Items."QryGroup34" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '34') 
	OR (Items."QryGroup35" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '35') 
	OR (Items."QryGroup36" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '36') 
	OR (Items."QryGroup37" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '37') 
	OR (Items."QryGroup38" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '38') 
	OR (Items."QryGroup39" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '39') 
	OR (Items."QryGroup40" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '40') 
	OR (Items."QryGroup41" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '41') 
	OR (Items."QryGroup42" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '42') 
	OR (Items."QryGroup43" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '43') 
	OR (Items."QryGroup44" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '44') 
	OR (Items."QryGroup45" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '45') 
	OR (Items."QryGroup46" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '46') 
	OR (Items."QryGroup47" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '47') 
	OR (Items."QryGroup48" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '48') 
	OR (Items."QryGroup49" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '49') 
	OR (Items."QryGroup50" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '50') 
	OR (Items."QryGroup51" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '51') 
	OR (Items."QryGroup52" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '52') 
	OR (Items."QryGroup53" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '53') 
	OR (Items."QryGroup54" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '54') 
	OR (Items."QryGroup55" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '55') 
	OR (Items."QryGroup56" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '56') 
	OR (Items."QryGroup57" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '57') 
	OR (Items."QryGroup58" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '58') 
	OR (Items."QryGroup59" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '59') 
	OR (Items."QryGroup60" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '60') 
	OR (Items."QryGroup61" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '61') 
	OR (Items."QryGroup62" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '62') 
	OR (Items."QryGroup63" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '63') 
	OR (Items."QryGroup64" = 'Y' 
		AND DiscountGroupItem."ItemGroup" = '64') ) WITH READ ONLY;



--88-----------------------------------------------------------88--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_ITEMPRICES_B1SLQuery" ( "ItemCode", "PriceList", "Price", "Currency" ) AS SELECT
    ItemPrices."ItemCode",
    ItemPrices."PriceList",
    COALESCE(ItemPrices."Price", 0) AS "Price",
    ItemPrices."Currency"
FROM "ITM1" AS ItemPrices;



--89-----------------------------------------------------------89--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_ITEMSACTIVITIES_B1SLQUERY" ( "Codigo", "Description", "ItemName", "ItemNameDefault", "OnHand", "Activo" ) AS SELECT	"ItemCode" AS "Codigo",
		"ItemName" AS "Description",
		UPPER("ItemName") AS "ItemName",
		'' AS "ItemNameDefault",
		COALESCE("OnHand", 0) AS "OnHand",
		CASE "InvntItem" WHEN 'Y' THEN 'SI' WHEN 'N' THEN 'NO' ELSE '' END AS "Activo"
FROM OITM WITH READ ONLY;



--90-----------------------------------------------------------90--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_ITEMSFORTRANSREQUEST_B1SLQuery" ( "ItemCode", "ItemName", "Barcode", "ManBtchNum", "ManSerNum", "Stock", "IWWhsCode", "SysNumber", "DistNumber" ) AS SELECT
	 DISTINCT Items."ItemCode",
	 Items."ItemName",
	 Items."CodeBars" AS "Barcode",
	 Items."ManBtchNum",
	 Items."ManSerNum",
	 CASE WHEN Items."ManSerNum" = 'Y' 
THEN COALESCE(Series."Qty",
	 0) 
ELSE (ItemsWarehouse."OnHand" - ItemsWarehouse."OnOrder") ----ItemsWarehouse."OnOrder"

END AS "Stock",
	 ItemsWarehouse."WhsCode" AS "IWWhsCode",
	 COALESCE(Series."SysNumber",
	 0) AS "SysNumber",
	 Series."DistNumber" 
FROM "OITM" Items 
INNER JOIN "OITW" ItemsWarehouse ON Items."ItemCode" = ItemsWarehouse."ItemCode" 
AND (ItemsWarehouse."OnHand" - ItemsWarehouse."OnOrder") > 0 ----ItemsWarehouse."OnOrder"

AND Items."InvntItem" = 'Y' 
AND Items."frozenFor" = 'N' 
LEFT JOIN "CLVS_D_MLT_SLT_GETSERIESFORTRANSFER" Series ON Items."ItemCode" = Series."ItemCode" 
AND ItemsWarehouse."WhsCode" = Series."WhsCode" WITH READ ONLY;



--91-----------------------------------------------------------91--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_ITEMS_B1SLQuery" ( "ItemCode", "ItemName", "BarCode", "ManSerNum", "ManBtchNum", "BinCode", "DistNumberSerie", "AbsEntry", "WhsCode", "Len", "SysNumber", "OnHand", "SQWhsCode", "IBAWhsCode", "PrchseItem", "InvntItem", "SellItem", "InvntItemDefault" ) AS SELECT
	 DISTINCT Items."ItemCode" AS "ItemCode",
	 Items."ItemName" AS "ItemName",
	 BarCodes."BcdCode" AS "BarCode",
	 Items."ManSerNum" AS "ManSerNum",
	 Items."ManBtchNum" AS "ManBtchNum",
	 COALESCE(Series."BinCode",
	 BinLocation."BinCode") AS "BinCode",
	 Series."DistNumber" AS "DistNumberSerie",
	 COALESCE(BinLocation."AbsEntry",
	 0) AS "AbsEntry",
	 Warehouse."WhsCode",
	 LENGTH(BarCodes."BcdCode") AS "Len",
	 IFNULL( CASE WHEN Items."ManBtchNum" = 'N' 
	AND Items."ManSerNum" = 'Y' 
	THEN Series."SysNumber" 
	ELSE NULL 
	END,
	 0 ) AS "SysNumber",
	 CASE WHEN Items."ManBtchNum" = 'N' 
AND Items."ManSerNum" = 'N' 
AND BinLocation."BinCode" IS NOT NULL 
THEN CAST(TO_DECIMAL(COALESCE(BinLocation."OnHandQty",
	 0),
	 18,
	 2) AS VARCHAR) WHEN Items."ManBtchNum" = 'N' 
AND Items."ManSerNum" = 'N' 
THEN CASE WHEN Items."InvntItem" = 'Y' 
THEN CASE WHEN (Warehouse."OnHand" - Warehouse."IsCommited") > 0 
THEN CAST(TO_DECIMAL((Warehouse."OnHand" - Warehouse."IsCommited"),
	 18,
	 2) AS VARCHAR) 
ELSE CAST(0 AS VARCHAR) 
END 
ELSE 'N/A' 
END WHEN Items."ManBtchNum" = 'N' 
AND Items."ManSerNum" = 'Y' 
THEN CAST(TO_DECIMAL(COALESCE(Series."Quantity",
	 0),
	 18,
	 2)AS VARCHAR) WHEN Items."ManBtchNum" = 'Y' 
AND Items."ManSerNum" = 'N' 
THEN CAST(TO_DECIMAL(COALESCE((SELECT
	 SUM("Quantity" - "CommitQty") 
				FROM OBTQ 
				WHERE "ItemCode" = Warehouse."ItemCode" 
				AND "WhsCode" = Warehouse."WhsCode"),
	 0),
	 18,
	 2) AS VARCHAR) 
ELSE CAST(0 AS VARCHAR) 
END AS "OnHand",
	 Series."SQWhsCode",
	 Series."IBAWhsCode",
	 Items."PrchseItem",
	 Items."InvntItem",
	 Items."SellItem",
	 'N' AS "InvntItemDefault" 
FROM OITM Items 
INNER JOIN OITW Warehouse ON Items."ItemCode" = Warehouse."ItemCode" 
AND Items."frozenFor" = 'N' 
INNER JOIN OWHS Warehouses ON Warehouse."WhsCode" = Warehouses."WhsCode" 
LEFT JOIN "CLVS_D_MLT_SLT_GETSERIESBYWHSCODE" Series ON Warehouse."WhsCode" = Series."SQWhsCode" 
AND Items."ItemCode" = Series."ItemCode" 
LEFT JOIN "CLVS_D_MLT_SLT_BINLOCATION" BinLocation ON Items."ItemCode" = BinLocation."ItemCode" 
AND BinLocation."WhsCode" = Warehouse."WhsCode" 
AND Items."ManBtchNum" = 'N' 
AND Items."ManSerNum" = 'N' 
LEFT JOIN OBCD BarCodes ON Items."ItemCode" = BarCodes."ItemCode" WITH READ ONLY;



--92-----------------------------------------------------------92--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_ITEMS_INVENTORYENTRY_B1SLQuery" ( "ItemCode", "ItemName", "FilterUpperCase", "BarCode", "ManSerNum", "ManBtchNum", "BinCode", "DistNumberSerie", "AbsEntry", "WhsCode", "Len", "SysNumber", "OnHand", "SQWhsCode", "IBAWhsCode", "PrchseItem", "InvntItem", "SellItem", "InvntItemDefault" ) AS SELECT
	 DISTINCT Items."ItemCode" AS "ItemCode",
	 Items."ItemName" AS "ItemName",
	 UPPER(CONCAT(Items."ItemCode",
	 CONCAT(' ',
	 Items."ItemName"))) AS "FilterUpperCase",
	 BarCodes."BcdCode" AS "BarCode",
	 Items."ManSerNum" AS "ManSerNum",
	 Items."ManBtchNum" AS "ManBtchNum",
	 COALESCE(Series."BinCode",
	 BinLocation."BinCode") AS "BinCode",
	 Series."DistNumber" AS "DistNumberSerie",
	 COALESCE(BinLocation."AbsEntry",
	 0) AS "AbsEntry",
	 0 as "WhsCode",
	 LENGTH(BarCodes."BcdCode") AS "Len",
	 IFNULL( CASE WHEN Items."ManBtchNum" = 'N' 
	AND Items."ManSerNum" = 'Y' 
	THEN Series."SysNumber" 
	ELSE NULL 
	END,
	 0 ) AS "SysNumber",
	  CAST(0 AS VARCHAR) AS "OnHand",
	 Series."SQWhsCode",
	 Series."IBAWhsCode",
	 Items."PrchseItem",
	 Items."InvntItem",
	 Items."SellItem",
	 'N' AS "InvntItemDefault" 
FROM OITM Items 
INNER JOIN OITW Warehouse ON Items."ItemCode" = Warehouse."ItemCode" 
AND Items."frozenFor" = 'N' 
INNER JOIN OWHS Warehouses ON Warehouse."WhsCode" = Warehouses."WhsCode" 
LEFT JOIN "CLVS_D_MLT_SLT_GETSERIESBYWHSCODE" Series ON Warehouse."WhsCode" = Series."SQWhsCode" 
AND Items."ItemCode" = Series."ItemCode" 
LEFT JOIN "CLVS_D_MLT_SLT_BINLOCATION" BinLocation ON Items."ItemCode" = BinLocation."ItemCode" 
AND BinLocation."WhsCode" = Warehouse."WhsCode" 
AND Items."ManBtchNum" = 'N' 
AND Items."ManSerNum" = 'N' 
LEFT JOIN OBCD BarCodes ON Items."ItemCode" = BarCodes."ItemCode" WITH READ ONLY;



--93-----------------------------------------------------------93--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_ITEMS_INVENTORY_B1SLQuery" ( "ItemCode", "ItemName", "FilterUpperCase", "BarCode", "ManSerNum", "ManBtchNum", "BinCode", "DistNumberSerie", "AbsEntry", "WhsCode", "Len", "SysNumber", "OnHand", "SQWhsCode", "IBAWhsCode", "PrchseItem", "InvntItem", "SellItem", "InvntItemDefault" ) AS SELECT
	 DISTINCT Items."ItemCode" AS "ItemCode",
	 Items."ItemName" AS "ItemName",
	 UPPER(CONCAT(Items."ItemCode", CONCAT(' ', Items."ItemName"))) AS "FilterUpperCase",
	 BarCodes."BcdCode" AS "BarCode",
	 Items."ManSerNum" AS "ManSerNum",
	 Items."ManBtchNum" AS "ManBtchNum",
	 COALESCE(Series."BinCode",
	 BinLocation."BinCode") AS "BinCode",
	 Series."DistNumber" AS "DistNumberSerie",
	 COALESCE(BinLocation."AbsEntry",
	 0) AS "AbsEntry",
	 Warehouse."WhsCode",
	 LENGTH(BarCodes."BcdCode") AS "Len",
	 IFNULL( CASE WHEN Items."ManBtchNum" = 'N' 
	AND Items."ManSerNum" = 'Y' 
	THEN Series."SysNumber" 
	ELSE NULL 
	END,
	 0 ) AS "SysNumber",
	 CASE WHEN Items."ManBtchNum" = 'N' 
AND Items."ManSerNum" = 'N' 
AND BinLocation."BinCode" IS NOT NULL 
THEN CAST(TO_DECIMAL(COALESCE(BinLocation."OnHandQty",
	 0),
	 18,
	 2) AS VARCHAR) WHEN Items."ManBtchNum" = 'N' 
AND Items."ManSerNum" = 'N' 
THEN CASE WHEN Items."InvntItem" = 'Y' 
THEN CASE WHEN (Warehouse."OnHand" - Warehouse."IsCommited") > 0 
THEN CAST(TO_DECIMAL((Warehouse."OnHand" - Warehouse."IsCommited"),
	 18,
	 2) AS VARCHAR) 
ELSE CAST(0 AS VARCHAR) 
END 
ELSE 'N/A' 
END WHEN Items."ManBtchNum" = 'N' 
AND Items."ManSerNum" = 'Y' 
THEN CAST(TO_DECIMAL(COALESCE(Series."Quantity",
	 0),
	 18,
	 2)AS VARCHAR) WHEN Items."ManBtchNum" = 'Y' 
AND Items."ManSerNum" = 'N' 
THEN CAST(TO_DECIMAL(COALESCE((SELECT
	 SUM("Quantity" - "CommitQty") 
				FROM OBTQ 
				WHERE "ItemCode" = Warehouse."ItemCode" 
				AND "WhsCode" = Warehouse."WhsCode"),
	 0),
	 18,
	 2) AS VARCHAR) 
ELSE CAST(0 AS VARCHAR) 
END AS "OnHand",
	 Series."SQWhsCode",
	 Series."IBAWhsCode",
	 Items."PrchseItem",
	 Items."InvntItem",
	 Items."SellItem",
	 'N' AS "InvntItemDefault" 
FROM OITM Items 
INNER JOIN OITW Warehouse ON Items."ItemCode" = Warehouse."ItemCode" 
AND Items."frozenFor" = 'N' 
INNER JOIN OWHS Warehouses ON Warehouse."WhsCode" = Warehouses."WhsCode" 
LEFT JOIN "CLVS_D_MLT_SLT_GETSERIESBYWHSCODE" Series ON Warehouse."WhsCode" = Series."SQWhsCode" 
AND Items."ItemCode" = Series."ItemCode" 
LEFT JOIN "CLVS_D_MLT_SLT_BINLOCATION" BinLocation ON Items."ItemCode" = BinLocation."ItemCode" 
AND BinLocation."WhsCode" = Warehouse."WhsCode" 
AND Items."ManBtchNum" = 'N' 
AND Items."ManSerNum" = 'N' 
LEFT JOIN OBCD BarCodes ON Items."ItemCode" = BarCodes."ItemCode" WITH READ ONLY;



--94-----------------------------------------------------------94--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_ITEMS_PURCHASE_B1SLQuery" ( "ItemCode", "ItemName", "FilterUpperCase", "BarCode", "ManSerNum", "ManBtchNum", "BinCode", "DistNumberSerie", "AbsEntry", "WhsCode", "Len", "SysNumber", "OnHand", "SQWhsCode", "IBAWhsCode", "PrchseItem", "InvntItem", "SellItem", "InvntItemDefault" ) AS SELECT
	 DISTINCT Items."ItemCode" AS "ItemCode",
	 Items."ItemName" AS "ItemName",
	 UPPER(CONCAT(Items."ItemCode" , CONCAT(' ', Items."ItemName"))) AS "FilterUpperCase",
	 BarCodes."BcdCode" AS "BarCode",
	 Items."ManSerNum" AS "ManSerNum",
	 Items."ManBtchNum" AS "ManBtchNum",
	 COALESCE(Series."BinCode",
	 BinLocation."BinCode") AS "BinCode",
	 Series."DistNumber" AS "DistNumberSerie",
	 COALESCE(BinLocation."AbsEntry",
	 0) AS "AbsEntry",
	 Warehouse."WhsCode",
	 LENGTH(BarCodes."BcdCode") AS "Len",
	 IFNULL( CASE WHEN Items."ManBtchNum" = 'N' 
	AND Items."ManSerNum" = 'Y' 
	THEN Series."SysNumber" 
	ELSE NULL 
	END,
	 0 ) AS "SysNumber",
	 CASE WHEN Items."ManBtchNum" = 'N' 
AND Items."ManSerNum" = 'N' 
AND BinLocation."BinCode" IS NOT NULL 
THEN CAST(TO_DECIMAL(COALESCE(BinLocation."OnHandQty",
	 0),
	 18,
	 2) AS VARCHAR) WHEN Items."ManBtchNum" = 'N' 
AND Items."ManSerNum" = 'N' 
THEN CASE WHEN Items."InvntItem" = 'Y' 
THEN CASE WHEN (Warehouse."OnHand" - Warehouse."IsCommited") > 0 
THEN CAST(TO_DECIMAL((Warehouse."OnHand" - Warehouse."IsCommited"),
	 18,
	 2) AS VARCHAR) 
ELSE CAST(0 AS VARCHAR) 
END 
ELSE 'N/A' 
END WHEN Items."ManBtchNum" = 'N' 
AND Items."ManSerNum" = 'Y' 
THEN CAST(TO_DECIMAL(COALESCE(Series."Quantity",
	 0),
	 18,
	 2)AS VARCHAR) WHEN Items."ManBtchNum" = 'Y' 
AND Items."ManSerNum" = 'N' 
THEN CAST(TO_DECIMAL(COALESCE((SELECT
	 SUM("Quantity" - "CommitQty") 
				FROM OBTQ 
				WHERE "ItemCode" = Warehouse."ItemCode" 
				AND "WhsCode" = Warehouse."WhsCode"),
	 0),
	 18,
	 2) AS VARCHAR) 
ELSE CAST(0 AS VARCHAR) 
END AS "OnHand",
	 Series."SQWhsCode",
	 Series."IBAWhsCode",
	 Items."PrchseItem",
	 Items."InvntItem",
	 Items."SellItem",
	 'N' AS "InvntItemDefault" 
FROM OITM Items 
INNER JOIN OITW Warehouse ON Items."ItemCode" = Warehouse."ItemCode" 
AND Items."frozenFor" = 'N' 
INNER JOIN OWHS Warehouses ON Warehouse."WhsCode" = Warehouses."WhsCode" 
LEFT JOIN "CLVS_D_MLT_SLT_GETSERIESBYWHSCODE" Series ON Warehouse."WhsCode" = Series."SQWhsCode" 
AND Items."ItemCode" = Series."ItemCode" 
LEFT JOIN "CLVS_D_MLT_SLT_BINLOCATION" BinLocation ON Items."ItemCode" = BinLocation."ItemCode" 
AND BinLocation."WhsCode" = Warehouse."WhsCode" 
AND Items."ManBtchNum" = 'N' 
AND Items."ManSerNum" = 'N' 
LEFT JOIN OBCD BarCodes ON Items."ItemCode" = BarCodes."ItemCode" WITH READ ONLY;



--95-----------------------------------------------------------95--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_ITEMS_SALES_B1SLQuery" ( "ItemCode", "ItemName", "FilterUpperCase", "BarCode", "ManSerNum", "ManBtchNum", "BinCode", "DistNumberSerie", "AbsEntry", "WhsCode", "Len", "SysNumber", "OnHand", "SQWhsCode", "IBAWhsCode", "PrchseItem", "InvntItem", "SellItem", "InvntItemDefault" ) AS SELECT
	 DISTINCT Items."ItemCode" AS "ItemCode",
	 Items."ItemName" AS "ItemName",
	 UPPER(CONCAT(Items."ItemCode", CONCAT(' ', Items."ItemName"))) AS "FilterUpperCase",
	 BarCodes."BcdCode" AS "BarCode",
	 Items."ManSerNum" AS "ManSerNum",
	 Items."ManBtchNum" AS "ManBtchNum",
	 COALESCE(Series."BinCode",
	 BinLocation."BinCode") AS "BinCode",
	 Series."DistNumber" AS "DistNumberSerie",
	 COALESCE(BinLocation."AbsEntry",
	 0) AS "AbsEntry",
	 Warehouse."WhsCode",
	 LENGTH(BarCodes."BcdCode") AS "Len",
	 IFNULL( CASE WHEN Items."ManBtchNum" = 'N' 
	AND Items."ManSerNum" = 'Y' 
	THEN Series."SysNumber" 
	ELSE NULL 
	END,
	 0 ) AS "SysNumber",
	 CASE WHEN Items."ManBtchNum" = 'N' 
AND Items."ManSerNum" = 'N' 
AND BinLocation."BinCode" IS NOT NULL 
THEN CAST(TO_DECIMAL(COALESCE(BinLocation."OnHandQty",
	 0),
	 18,
	 2) AS VARCHAR) WHEN Items."ManBtchNum" = 'N' 
AND Items."ManSerNum" = 'N' 
THEN CASE WHEN Items."InvntItem" = 'Y' 
THEN CASE WHEN (Warehouse."OnHand" - Warehouse."IsCommited") > 0 
THEN CAST(TO_DECIMAL((Warehouse."OnHand" - Warehouse."IsCommited"),
	 18,
	 2) AS VARCHAR) 
ELSE CAST(0 AS VARCHAR) 
END 
ELSE 'N/A' 
END WHEN Items."ManBtchNum" = 'N' 
AND Items."ManSerNum" = 'Y' 
THEN CAST(TO_DECIMAL(COALESCE(Series."Quantity",
	 0),
	 18,
	 2)AS VARCHAR) WHEN Items."ManBtchNum" = 'Y' 
AND Items."ManSerNum" = 'N' 
THEN CAST(TO_DECIMAL(COALESCE((SELECT
	 SUM("Quantity" - "CommitQty") 
				FROM OBTQ 
				WHERE "ItemCode" = Warehouse."ItemCode" 
				AND "WhsCode" = Warehouse."WhsCode"),
	 0),
	 18,
	 2) AS VARCHAR) 
ELSE CAST(0 AS VARCHAR) 
END AS "OnHand",
	 Series."SQWhsCode",
	 Series."IBAWhsCode",
	 Items."PrchseItem",
	 Items."InvntItem",
	 Items."SellItem",
	 'N' AS "InvntItemDefault" 
FROM OITM Items 
INNER JOIN OITW Warehouse ON Items."ItemCode" = Warehouse."ItemCode" 
AND Items."frozenFor" = 'N' 
INNER JOIN OWHS Warehouses ON Warehouse."WhsCode" = Warehouses."WhsCode" 
LEFT JOIN "CLVS_D_MLT_SLT_GETSERIESBYWHSCODE" Series ON Warehouse."WhsCode" = Series."SQWhsCode" 
AND Items."ItemCode" = Series."ItemCode" 
LEFT JOIN "CLVS_D_MLT_SLT_BINLOCATION" BinLocation ON Items."ItemCode" = BinLocation."ItemCode" 
AND BinLocation."WhsCode" = Warehouse."WhsCode" 
AND Items."ManBtchNum" = 'N' 
AND Items."ManSerNum" = 'N' 
LEFT JOIN OBCD BarCodes ON Items."ItemCode" = BarCodes."ItemCode" WITH READ ONLY;



--96-----------------------------------------------------------96--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_ITEM_ALLOCATIONS_B1SLQuery" ( "AbsEntry", "BinCode", "Stock", "ItemCode", "WhsCode" ) AS SELECT
    "BIN"."AbsEntry" AS "AbsEntry",
    "BIN"."BinCode" AS "BinCode",
    TO_DECIMAL("IBQ"."OnHandQty", 18, 2) AS "Stock",
    "IBQ"."ItemCode" AS "ItemCode",
    "IBQ"."WhsCode" AS "WhsCode"
FROM "OBIN" AS "BIN"
INNER JOIN "OIBQ" AS "IBQ" ON "IBQ"."BinAbs" = "BIN"."AbsEntry" AND "IBQ"."OnHandQty" > 0
INNER JOIN "OITW" AS "ITW" ON "ITW"."ItemCode" = "IBQ"."ItemCode" AND "ITW"."WhsCode" = "IBQ"."WhsCode"
INNER JOIN "OITM" AS "ITM" ON "IBQ"."ItemCode" = "ITM"."ItemCode"
WHERE "ITM"."ManBtchNum" = 'N' WITH READ ONLY;



--97-----------------------------------------------------------97--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_ITEM_AVGPRICE_B1SLQuery" ( "AVGPrice", "ItemCode" ) AS SELECT ItemsWarehouses."AvgPrice" AS "AVGPrice",
       ItemsWarehouses."ItemCode" 
FROM "OITW" ItemsWarehouses LIMIT 1 WITH READ ONLY;



--98-----------------------------------------------------------98--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_ITEM_B1SLQuery" ( "ItemCode", "ItemName", "IsCommited", "OnOrder", "BarCode", "SalesItem", "InventoryItem", "ForeingName", "LastPurCur", "TaxCode", "TaxRate", "OnHand", "LastPurchasePrice", "LastPurchasePriceFC", "HasInconsistency", "InconsistencyMessage", "ItemClass", "TreeType", "CardCode", "PriceList", "WhsCode", "SSWhsCode", "SysNumber", "ListNum", "SysNumberDefault", "HideComp", "VATLiable" ) AS SELECT
	 "Items"."ItemCode",
	 "Items"."ItemName",
	 "Items"."IsCommited",
	 "Items"."OnOrder",
	 "Items"."CodeBars" AS "BarCode",
	 "Items"."SellItem" AS "SalesItem",
	 "Items"."InvntItem" AS "InventoryItem",
	 "Items"."FrgnName" AS "ForeingName",
	 "LastPurCur",
	 COALESCE("CLVS_D_MLT_SLT_TAXCODE"("BusinessPartner"."CardCode",
	 "Items"."ItemCode"),
	 '') AS "TaxCode",
	 COALESCE("CLVS_D_MLT_SLT_TAXRATE"(COALESCE("CLVS_D_MLT_SLT_TAXCODE"("BusinessPartner"."CardCode",
	 "Items"."ItemCode"),
	 '')),
	 0) AS "TaxRate",
	 COALESCE( CASE WHEN SERIAL_STOCK."SysNumber" IS NULL 
	AND COALESCE(BATCH_STOCK."Quantity",
	 0) = 0 
	THEN ITEM_STOCK."OnHand" 
	ELSE 0 
	END,
	 0 ) -- ITEM STOCK
+ COALESCE( CASE WHEN SERIAL_STOCK."SysNumber" IS NULL 
	THEN 0 
	ELSE SERIAL_STOCK."Quantity" 
	END,
	 0 ) -- SERIAL STOCK
+ COALESCE(BATCH_STOCK."Quantity",
	 0) AS "OnHand",
	 -- BATCH STOCK
 COALESCE( CASE WHEN "CLVS_D_MLT_SLT_ISLOCALCURRENCY"((SELECT
	 TOP 1 "df"."MainCurncy" 
			FROM "OADM" "df")) = 1 
	THEN "Items"."AvgPrice" 
	ELSE "Items"."AvgPrice" * ( SELECT
	 "Rate" 
		FROM "ORTT" 
		WHERE "RateDate" = CURRENT_DATE 
		AND "Currency" = ( SELECT
	 "Id" 
			FROM "CLVS_D_MLT_SLT_CURRENCIES_B1SLQuery" 
			WHERE "IsLocal" = 0 
			AND "Id" <> '##' ) ) 
	END ,
	 0.00) AS "LastPurchasePrice",
	 COALESCE( CASE WHEN "CLVS_D_MLT_SLT_ISLOCALCURRENCY"((SELECT
	 TOP 1 "df"."MainCurncy" 
			FROM "OADM" "df")) = 1 
	THEN "Items"."AvgPrice" / ( SELECT
	 "Rate" 
		FROM "ORTT" 
		WHERE "RateDate" = CURRENT_DATE 
		AND "Currency" = ( SELECT
	 "Id" 
			FROM "CLVS_D_MLT_SLT_CURRENCIES_B1SLQuery" 
			WHERE "IsLocal" = 0 
			AND "Id" <> '##' ) ) 
	ELSE "Items"."AvgPrice" 
	END ,
	 0.00) AS "LastPurchasePriceFC",
	 ( SELECT
	 COUNT(*) 
	FROM "OPLN" "PL" 
	WHERE "PL"."ListNum" = "ItemsPrices"."PriceList" 
	AND "PL"."ValidFor"='Y' 
	AND "ItemsPrices"."Currency" <> "PL"."PrimCurr" ) AS "HasInconsistency",
	 'Listas de precios inconsistentes - modificado en sp' AS "InconsistencyMessage",
	 "IT"."ItemClass" AS "ItemClass",
	 "Items"."TreeType",
	 "BusinessPartner"."CardCode",
	 "ItemsPrices"."PriceList",
	 "ITEM_STOCK"."WhsCode" AS "WhsCode",
	 "SERIAL_STOCK"."WhsCode" AS "SSWhsCode",
	 COALESCE("SERIAL_STOCK"."SysNumber",
	 0) AS "SysNumber",
	 "COM_CURR"."ListNum",
	 0 AS "SysNumberDefault",
	 OIT."HideComp" AS "HideComp",
	 ( CAST
		(
			CASE 
				WHEN "Items"."VATLiable" = 'Y' THEN 1
				ELSE 0
			END AS INT
		)
	)AS "VATLiable" 
FROM "OITM" "Items" 
INNER JOIN "CLVS_D_MLT_SLT_OITM_STOCK" "ITEM_STOCK" ON "ITEM_STOCK"."ItemCode" = "Items"."ItemCode" 
INNER JOIN "ITM1" "ItemsPrices" ON "Items"."ItemCode" = "ItemsPrices"."ItemCode" 
LEFT JOIN "OITB" "IT" ON "Items"."ItmsGrpCod" = "IT"."ItmsGrpCod" 
LEFT JOIN "CLVS_D_MLT_SLT_BATCH_STOCK" "BATCH_STOCK" ON "BATCH_STOCK"."ItemCode" = "Items"."ItemCode" 
LEFT JOIN "CLVS_D_MLT_SLT_SERIAL_STOCK" "SERIAL_STOCK" ON "SERIAL_STOCK"."ItemCode" = "Items"."ItemCode" 
LEFT JOIN "CLVS_D_MLT_SLT_PRICELIST_BY_COMPANY_CURRENCY" "COM_CURR" ON "COM_CURR"."ListNum" = "ItemsPrices"."PriceList" 
LEFT JOIN ( SELECT
	 '' AS "CardCode" 
	FROM dummy 
	UNION SELECT
	 "BP"."CardCode" 
	FROM "OCRD" "BP" ) AS "BusinessPartner" ON "BusinessPartner"."CardCode" = "BusinessPartner"."CardCode" 
LEFT JOIN OITT AS OIT ON OIT."Code"="Items"."ItemCode" WITH READ ONLY;



--99-----------------------------------------------------------99--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_ITEM_BATCH_ALLOCATIONS_B1SLQuery" ( "BatchNumber", "BinAbs", "BinCode", "Stock", "LotesItemCode", "ItemCode", "ItemBinAccumulatorWhsCode", "BatchQtyWhsCode" ) AS SELECT
    "Lotes"."DistNumber" AS "BatchNumber",
    COALESCE("Ubicaciones"."AbsEntry", 0) AS "BinAbs",
    "Ubicaciones"."BinCode",
    COALESCE(CAST("ItemBinAccumulator"."OnHandQty" AS DECIMAL(18,2)), 0) AS "Stock",
    "Lotes"."ItemCode" AS "LotesItemCode",
    "BatchQty"."ItemCode" AS "ItemCode",
    "ItemBinAccumulator"."WhsCode" AS "ItemBinAccumulatorWhsCode",
    "BatchQty"."WhsCode" AS "BatchQtyWhsCode"
FROM
    "OBTN" AS "Lotes"
INNER JOIN
    "OBTQ" AS "BatchQty" ON "Lotes"."AbsEntry" = "BatchQty"."MdAbsEntry"
LEFT JOIN
    "OBBQ" AS "ItemBinAccumulator" ON "Lotes"."AbsEntry" = "ItemBinAccumulator"."SnBMDAbs"
LEFT JOIN
    "OBIN" AS "Ubicaciones" ON "ItemBinAccumulator"."BinAbs" = "Ubicaciones"."AbsEntry" WITH READ ONLY;



--100-----------------------------------------------------------100--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_ITEM_INVENTORY_DETAILS_B1SLQuery" ( "ItemCode", "ItemName", "TaxCode", "ForeignName", "ItemClass", "WhsCode", "WhsName", "OnHand", "IsCommited", "OnOrder", "Available" ) AS SELECT
	 DISTINCT Item."ItemCode",
	 Item."ItemName",
	 Item."U_IVA" AS "TaxCode",
	 Item."FrgnName" AS "ForeignName",
	 Item."ItemClass",
	 ItemWarehouses."WhsCode",
	 Warehouses."WhsName",
	 TO_DECIMAL(COALESCE(ItemWarehouses."OnHand",
	 0),
	 18,
	 2) AS "OnHand",
	 TO_DECIMAL(COALESCE(ItemWarehouses."IsCommited",
	 0),
	 18,
	 2) AS "IsCommited",
	 TO_DECIMAL(COALESCE(ItemWarehouses."OnOrder",
	 0),
	 18,
	 2) AS "OnOrder",
	 TO_DECIMAL(COALESCE(CASE WHEN (ItemWarehouses."OnHand" - ItemWarehouses."IsCommited") < 0 
		THEN 0 
		ELSE (ItemWarehouses."OnHand" - ItemWarehouses."IsCommited") 
		END,
	 0),
	 18,
	 2) AS "Available" 
FROM "OITM" AS Item 
LEFT JOIN "OITW" ItemWarehouses ON Item."ItemCode" = ItemWarehouses."ItemCode" 
LEFT JOIN "OWHS" Warehouses ON ItemWarehouses."WhsCode" = Warehouses."WhsCode" 
WHERE Item."frozenFor" = 'N' WITH READ ONLY;



--101-----------------------------------------------------------101--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_ITEM_LASTPRICE_B1SLQuery" ( "LastPrice", "ItemCode" ) AS SELECT
    COALESCE(CAST(DN."Price" AS DECIMAL(18,2)), 0) AS "LastPrice",
    DN."ItemCode"
FROM
    "OPDN" AS PD
INNER JOIN
    "PDN1" AS DN ON DN."DocEntry" = PD."DocEntry"
INNER JOIN
    "OITM" AS IT ON IT."ItemCode" = DN."ItemCode" ORDER BY
    PD."DocNum" DESC LIMIT 1 WITH READ ONLY;



--102-----------------------------------------------------------102--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_ITEM_PURCHASE_DETAIL_B1SLQuery" ( "DocNum", "TaxRate", "LastPurPrc", "DocEntry", "CardName", "CardCode", "ItemCode", "Comments", "ItemDescription", "Available", "OnHand", "Requested", "IsCommited", "Quantity", "DocDate", "DocTotal", "WhsCode", "TaxCode", "Price", "WhsName", "DocType" ) AS (((SELECT
	 "DocNum",
	 "U_IVA" AS "TaxRate",
	 COALESCE("LastPurPrc",
	 0) AS "LastPurPrc",
	 "DocEntry",
	 "CardName",
	 "CardCode",
	 "ItemCode",
	 "Comments",
	 "ItemName" AS "ItemDescription",
	 CASE WHEN "OnHand" - "IsCommited" > 0 
			THEN COALESCE(("OnHand" - "IsCommited"),
	 0) 
			ELSE 0 
			END AS "Available",
	 "OnHand",
	 "OnOrder" AS "Requested",
	 "IsCommited",
	 "Quantity",
	 "DocDate",
	 "DocTotal",
	 "WhsCode",
	 "TaxCode",
	 "Price",
	 "WhsName",
	 'OPDN' AS "DocType" 
			FROM ( SELECT
	 DISTINCT PD."DocNum",
	 IT."U_IVA",
	 COALESCE(IT."LastPurPrc",
	 0) AS "LastPurPrc",
	 PD."DocEntry",
	 PD."CardName",
	 PD."CardCode",
	 DN."ItemCode",
	 PD."Comments",
	 IT."ItemName",
	 IW."OnHand",
	 IW."OnOrder",
	 IW."IsCommited",
	 DN."Quantity",
	 DN."DocDate",
	 PD."DocTotal",
	 DN."WhsCode",
	 DN."TaxCode",
	 DN."Price",
	 WH."WhsName" 
				FROM "OPDN" PD 
				INNER JOIN "PDN1" DN ON DN."DocEntry" = PD."DocEntry" 
				INNER JOIN "OITM" IT ON IT."ItemCode" = DN."ItemCode" 
				INNER JOIN "OITW" IW ON IW."ItemCode" = IT."ItemCode" 
				INNER JOIN "OWHS" WH ON WH."WhsCode" = DN."WhsCode" 
				ORDER BY PD."DocNum" DESC LIMIT 40000 ) AS OPDN) UNION (SELECT
	 "DocNum",
	 "U_IVA" AS "TaxRate",
	 COALESCE("LastPurPrc",
	 0) AS "LastPurPrc",
	 "DocEntry",
	 "CardName",
	 "CardCode",
	 "ItemCode",
	 "Comments",
	 "ItemName" AS "ItemDescription",
	 CASE WHEN "OnHand" - "IsCommited" > 0 
			THEN COALESCE(("OnHand" - "IsCommited"),
	 0) 
			ELSE 0 
			END AS "Available",
	 "OnHand",
	 "OnOrder" AS "Requested",
	 "IsCommited",
	 "Quantity",
	 "DocDate",
	 "DocTotal",
	 "WhsCode",
	 "TaxCode",
	 "Price",
	 "WhsName",
	 'OPCH' AS "DocType" 
			FROM ( SELECT
	 DISTINCT PD."DocNum",
	 IT."U_IVA",
	 COALESCE(IT."LastPurPrc",
	 0) AS "LastPurPrc",
	 PD."DocEntry",
	 PD."CardName",
	 PD."CardCode",
	 DN."ItemCode",
	 PD."Comments",
	 IT."ItemName",
	 IW."OnHand",
	 IW."OnOrder",
	 IW."IsCommited",
	 DN."Quantity",
	 DN."DocDate",
	 PD."DocTotal",
	 DN."WhsCode",
	 DN."TaxCode",
	 DN."Price",
	 WH."WhsName" 
				FROM "OPCH" PD 
				INNER JOIN "PDN1" DN ON DN."DocEntry" = PD."DocEntry" 
				INNER JOIN "OITM" IT ON IT."ItemCode" = DN."ItemCode" 
				INNER JOIN "OITW" IW ON IW."ItemCode" = IT."ItemCode" 
				INNER JOIN "OWHS" WH ON WH."WhsCode" = DN."WhsCode" 
				ORDER BY PD."DocNum" DESC LIMIT 40000 ) AS OPCH)) UNION (SELECT
	 "DocNum",
	 "U_IVA" AS "TaxRate",
	 COALESCE("LastPurPrc",
	 0) AS "LastPurPrc",
	 "DocEntry",
	 "CardName",
	 "CardCode",
	 "ItemCode",
	 "Comments",
	 "ItemName" AS "ItemDescription",
	 CASE WHEN "OnHand" - "IsCommited" > 0 
		THEN COALESCE(("OnHand" - "IsCommited"),
	 0) 
		ELSE 0 
		END AS "Available",
	 "OnHand",
	 "OnOrder" AS "Requested",
	 "IsCommited",
	 "Quantity",
	 "DocDate",
	 "DocTotal",
	 "WhsCode",
	 "TaxCode",
	 "Price",
	 "WhsName",
	 'OPOR' AS "DocType" 
		FROM ( SELECT
	 DISTINCT PD."DocNum",
	 IT."U_IVA",
	 COALESCE(IT."LastPurPrc",
	 0) AS "LastPurPrc",
	 PD."DocEntry",
	 PD."CardName",
	 PD."CardCode",
	 DN."ItemCode",
	 PD."Comments",
	 IT."ItemName",
	 IW."OnHand",
	 IW."OnOrder",
	 IW."IsCommited",
	 DN."Quantity",
	 DN."DocDate",
	 PD."DocTotal",
	 DN."WhsCode",
	 DN."TaxCode",
	 DN."Price",
	 WH."WhsName" 
			FROM "OPOR" PD 
			INNER JOIN "PDN1" DN ON DN."DocEntry" = PD."DocEntry" 
			INNER JOIN "OITM" IT ON IT."ItemCode" = DN."ItemCode" 
			INNER JOIN "OITW" IW ON IW."ItemCode" = IT."ItemCode" 
			INNER JOIN "OWHS" WH ON WH."WhsCode" = DN."WhsCode" ))) WITH READ ONLY;



--103-----------------------------------------------------------103--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_LISTMATERIAL_B1SLQuery" ( "FatherCode", "ItemCode", "ItemName", "IsCommited", "OnOrder", "ManSerNum", "ManBtchNum", "BarCode", "SalesItem", "DiscountPercent", "InventoryItem", "ForeingName", "LastPurCur", "TaxRate", "TaxCode", "OnHand", "LastPurchasePrice", "LastPurchasePriceFC", "HasInconsistency", "InconsistencyMessage", "ItemClass", "TreeType", "CardCode", "PriceList", "WhsCode", "ListNum", "Quantity" ) AS SELECT
	 childrenMaterial."Father" AS "FatherCode",
	 childrenMaterial."Code" AS "ItemCode",
	 Items."ItemName",
	 Items."IsCommited",
	 Items."OnOrder",
	 Items."ManSerNum",
	 Items."ManBtchNum",
	 Items."CodeBars" AS "BarCode",
	 Items."SellItem" AS "SalesItem",
	 COALESCE(DG."Discount",
	 0.0) AS "DiscountPercent",
	 Items."InvntItem" AS "InventoryItem",
	 Items."FrgnName" AS "ForeingName",
	 Items."LastPurCur",
	 CLVS_D_MLT_SLT_TAXRATE("U_IVA") AS "TaxRate",
	 "U_IVA" AS "TaxCode",
	 ITEM_STOCK."OnHand",
	 ( CASE WHEN COM_CURR."MainCurncy" IS NOT NULL 
	THEN ( SELECT
	 SIT."AvgPrice" AS "LastPurPrc" 
		FROM "OITW" SIT 
		WHERE SIT."ItemCode" = Items."ItemCode" 
		AND SIT."WhsCode" = ITEM_STOCK."WhsCode" ) 
	ELSE ( SELECT
	 SIT."AvgPrice" / ( SELECT
	 T0."Rate" 
			FROM "ORTT" T0 
			WHERE T0."RateDate" = CURRENT_DATE 
			AND T0."Currency" = ( SELECT
	 curr."PrimCurr" 
				FROM "OPLN" curr 
				WHERE curr."ListNum" = COM_CURR."ListNum" ) ) AS "LastPurPrc" 
		FROM "OITW" SIT 
		WHERE SIT."ItemCode" = Items."ItemCode" 
		AND SIT."WhsCode" = ITEM_STOCK."WhsCode" ) 
	END ) AS "LastPurchasePrice",
	 -1 AS "LastPurchasePriceFC",
	 ( SELECT
	 COUNT(*) 
	FROM "OPLN" PL 
	WHERE PL."ListNum" = ItemsPrices."PriceList" 
	AND PL."ValidFor"='Y'
	AND ItemsPrices."Currency" <> PL."PrimCurr" ) AS "HasInconsistency",
	 'Listas de precios inconsistentes - modificado en sp' AS "InconsistencyMessage",
	 IT."ItemClass" AS "ItemClass",
	 Items."TreeType",
	 CR."CardCode",
	 ItemsPrices."PriceList",
	 ITEM_STOCK."WhsCode" AS "WhsCode",
	 COM_CURR."ListNum",
	 childrenMaterial."Quantity" 
FROM "OITM" Items 
INNER JOIN "CLVS_D_MLT_SLT_OITM_STOCK" ITEM_STOCK ON ITEM_STOCK."ItemCode" = Items."ItemCode" 
INNER JOIN "ITT1" childrenMaterial ON ITEM_STOCK."ItemCode" = childrenMaterial."Code" 
INNER JOIN "ITM1" ItemsPrices ON Items."ItemCode" = ItemsPrices."ItemCode" 
LEFT JOIN "OITB" IT ON Items."ItmsGrpCod" = IT."ItmsGrpCod" 
LEFT JOIN "OCRD" CR ON Items."CardCode" = CR."CardCode" 
LEFT JOIN "CLVS_D_MLT_SLT_DISCGROUP" DG ON CAST(Items."CardCode" AS VARCHAR(100)) = CAST(DG."CardGroup" AS NVARCHAR(100)) 
AND CAST(Items."ItmsGrpCod" AS VARCHAR(100)) = CAST(DG."ItemGroup" AS VARCHAR(100)) 
LEFT JOIN "CLVS_D_MLT_SLT_PRICELIST_BY_COMPANY_CURRENCY" COM_CURR ON COM_CURR."ListNum" = ItemsPrices."PriceList" WITH READ ONLY;



--104-----------------------------------------------------------104--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_LOCATIONACTIVITIES_B1SLQuery" ( "Code", "Name" ) AS SELECT
    "Code",
    "Name"
FROM "OCLO";



--105-----------------------------------------------------------105--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_MASTERDATAITEMS_B1SLQuery" ( "ItemCode", "ItemName", "FilterUpperCase", "TaxCode", "ForeignName", "ItemClass", "BarCode" ) AS SELECT
	 "Item"."ItemCode",
	 "Item"."ItemName",
	 UPPER(CONCAT("Item"."ItemCode", CONCAT(' ', "Item"."ItemName"))) AS "FilterUpperCase",
	 "Item"."U_IVA" AS "TaxCode",
	 "Item"."FrgnName" AS "ForeignName",
	 "Item"."ItemClass",
	 "BarCodes"."BcdCode" AS "BarCode" 
FROM "OITM" AS "Item" 
LEFT JOIN "OBCD" AS "BarCodes" ON "Item"."ItemCode" = "BarCodes"."ItemCode" 
WHERE "Item"."frozenFor" = 'N' WITH READ ONLY;



--106-----------------------------------------------------------106--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_MDBUSINESSPARTNERS_B1SLQuery" ( "CardCode", "CardName", "FilterUpperCase", "CardType", "FederalTaxID", "EmailAddress", "Address", "Phone1", "Currency", "PayTermsGrpCode", "GroupCode", "FatherType", "FatherCard", "DiscountPercent", "MaxCommitment", "Frozen", "PriceListNum", "SalesPersonCode", "BilltoDefault", "ShiptoDefault", "TypeIdentification", "Provincia", "Canton", "Distrito", "Barrio", "Direccion", "CashCustomer", "Device", "DocDateFilter", "CreateDate", "AttachmentEntry" ) AS SELECT
	 "CardCode" AS "CardCode",
	 "CardName" AS "CardName",
	 UPPER(CONCAT("CardCode",
	 CONCAT(' ',
	 "CardName"))) AS "FilterUpperCase",
	 "CardType" AS "CardType",
	 "LicTradNum" AS "FederalTaxID",
	 "E_Mail" AS "EmailAddress",
	 "Address" AS "Address",
	 "Phone1" AS "Phone1",
	 "Currency" AS "Currency",
	 "GroupNum" AS "PayTermsGrpCode",
	 "GroupCode" AS "GroupCode",
	 CASE WHEN "FatherType" = 'P' 
THEN 'cPayments_sum' WHEN "FatherType" = 'D' 
THEN 'cDelivery_sum' 
ELSE '' 
END AS "FatherType",
	 "FatherCard",
	 COALESCE("Discount",
	 0) AS "DiscountPercent",
	 "DebtLine" AS "MaxCommitment",
	 CASE WHEN "frozenFor" = 'Y' 
THEN 'tYES' WHEN "frozenFor" = 'N' 
THEN 'tNO' 
ELSE '' 
END AS "Frozen",
	 "ListNum" AS "PriceListNum",
	 "SlpCode" AS "SalesPersonCode",
	 "BillToDef" AS "BilltoDefault",
	 "ShipToDef" AS "ShiptoDefault",
	 "U_TipoIdentificacion" AS "TypeIdentification",
	 "U_provincia" AS "Provincia",
	 "U_canton" AS "Canton",
	 "U_distrito" AS "Distrito",
	 "U_barrio" AS "Barrio",
	 "U_direccion" AS "Direccion",
	 CASE WHEN "QryGroup1" = 'Y' 
THEN 1 
ELSE 0 
END AS "CashCustomer",
	 "U_EMA_Device" AS "Device",
	 "CreateDate" AS "DocDateFilter",
	 "CLVS_D_MLT_SLT_DOCFULLDATE"(0,
	 "CreateDate") AS "CreateDate",
	 "AtcEntry" AS "AttachmentEntry" 
FROM "OCRD";



--107-----------------------------------------------------------107--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_MOBILEACCOUNTS_B1SLQuery" ( "AccountName", "Account", "Currency" ) AS SELECT
	
	("Segment_0" || '-' || "AcctName") AS "AccountName",
	"AcctCode" AS "Account",
	"ActCurr" AS "Currency"
FROM
	"OACT"
WHERE
	"Finanse" = 'Y';



--108-----------------------------------------------------------108--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_MOBILEALLOCATIONS_B1SLQuery" ( "BatchNumber", "BinAbs", "BinCode", "Stock", "LotesItemCode", "ItemCode", "ItemBinAccumulatorWhsCode", "BatchQtyWhsCode" ) AS SELECT
	Lotes."DistNumber" AS "BatchNumber",
	COALESCE(Ubicaciones."AbsEntry", 0) AS "BinAbs",
	Ubicaciones."BinCode",
	COALESCE(CAST(ItemBinAccumulator."OnHandQty" AS DECIMAL(18, 2)), 0) AS "Stock",
	Lotes."ItemCode" AS "LotesItemCode",
	BatchQty."ItemCode" AS "ItemCode",
	ItemBinAccumulator."WhsCode" AS "ItemBinAccumulatorWhsCode",
	BatchQty."WhsCode" AS "BatchQtyWhsCode"
FROM
	"OBTN" Lotes
INNER JOIN
	"OBTQ" BatchQty ON Lotes."AbsEntry" = BatchQty."MdAbsEntry"
LEFT JOIN
	"OBBQ" ItemBinAccumulator ON Lotes."AbsEntry" = ItemBinAccumulator."SnBMDAbs"
LEFT JOIN
	"OBIN" Ubicaciones ON ItemBinAccumulator."BinAbs" = Ubicaciones."AbsEntry" WITH READ ONLY;



--109-----------------------------------------------------------109--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_MOBILEBILLOFMATERIALS_B1SLQUERY" ( "FatherCode", "ItemCode", "Quantity", "UpdateDateTime" ) AS SELECT
	 childrenMaterial."Father" AS "FatherCode",
	 childrenMaterial."Code" AS "ItemCode",
	 childrenMaterial."Quantity",
	 CLVS_D_MLT_SLT_TIMESPAN(CLVS_D_MLT_SLT_DOCFULLDATE(0, COALESCE("UpdateDate","CreateDate")), COALESCE("UpdateTS","CreateTS")) AS "UpdateDateTime" 
FROM OITM Items 
INNER JOIN ITT1 childrenMaterial ON Items."ItemCode" = childrenMaterial."Code" WITH READ ONLY;



--110-----------------------------------------------------------110--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_MOBILEBLANKETAGREEMENTDETAILS_B1SLQuery" ( "AbsID", "ItemCode", "ItemGroup", "UnitPrice", "PlanQty" ) AS SELECT
	OA."AbsID",
	"AT"."ItemCode",
	"AT"."ItemGroup",
	CAST("AT"."UnitPrice" AS DOUBLE) AS "UnitPrice",
	CAST("AT"."PlanQty" AS DOUBLE) AS "PlanQty"
FROM
	"OOAT" OA
JOIN
	"OAT1" "AT" ON "AT"."AgrNo" = OA."AbsID" WITH READ ONLY;



--111-----------------------------------------------------------111--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_MOBILEBLANKETAGREEMENTS_B1SLQuery" ( "AbsID", "CardCode", "BpType", "StartDate", "EndDate", "TerminationDate", "Description", "Type", "PayMethod", "Status" ) AS SELECT
	OA."AbsID",
	OA."BpCode" AS "CardCode",
	OA."BpType",
	OA."StartDate",
	CAST('30001230' AS DATE) AS "EndDate",
	OA."TermDate" AS "TerminationDate",
	IFNULL(OA."Descript", '') AS "Description",
	OA."Type",
	OA."PayMethod",
	OA."Status"
FROM
	"OOAT" OA;



--112-----------------------------------------------------------112--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_MOBILEBPQTY_B1SLQuery" ( "Count" ) AS SELECT
	 COUNT("CardCode") AS "Count" 
FROM "CLVS_D_MLT_SLT_MOBILEBUSINESSPARTNERS_B1SLQuery" WITH READ ONLY;



--113-----------------------------------------------------------113--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_MOBILEBUSINESSPARTNERS_B1SLQuery" ( "CardCode", "CardName", "Currency", "ShipToDef", "TaxCode", "CreditLine", "Balance", "Phone1", "Cellular", "EMail", "Discount", "HeaderDiscount", "PriceListNum", "PayTermsCode", "BPGroup", "SlpCode", "Lat", "Lng", "ContactPerson", "DefCur", "U_TipoIdentificacion", "Cedula", "U_provincia", "U_canton", "U_distrito", "U_barrio", "U_direccion", "SubTipo", "CashCustomer", "GroupCode", "LicTradNum", "IntrntSite", "Notes", "ControlSerie", "OTCXCondition", "UpdateDateTime" ) AS SELECT
	 "CardCode",
	 COALESCE("CardName",
	 '') AS "CardName",
	 "Currency",
	 "ShipToDef",
	 ( SELECT
	 "TaxCode" 
	FROM "CRD1" A 
	WHERE A."AdresType" = 'S' 
	AND A."Address" = "ShipToDef" 
	AND A."CardCode" = "OCRD"."CardCode" ) "TaxCode",
	 ( CASE WHEN "Currency" = '##' 
	THEN (SELECT
	 "Id" 
		FROM "CLVS_D_MLT_SLT_CURRENCIES_B1SLQuery" 
		WHERE "IsLocal" = 1) 
	ELSE "Currency" 
	END || ' ' || CAST(CAST("CreditLine" AS DECIMAL(18,
	 2)) AS VARCHAR(500)) ) AS "CreditLine",
	 (SELECT
	 "Id" 
	FROM "CLVS_D_MLT_SLT_CURRENCIES_B1SLQuery" 
	WHERE "IsLocal" = 1) || ' ' || CAST(CAST("Balance" AS DECIMAL(18,
	 2)) AS VARCHAR(500)) AS "Balance",
	 "Phone1",
	 COALESCE("Cellular",
	 '') AS "Cellular",
	 COALESCE("E_Mail",
	 '') AS "EMail",
	 COALESCE("Discount",
	 0) AS "Discount",
	 COALESCE("U_MaxDiscBP",
	 0) AS "HeaderDiscount",
	 COALESCE("ListNum",
	 -1) AS "PriceListNum",
	 COALESCE("GroupNum",
	 -1) AS "PayTermsCode",
	 COALESCE("GroupCode",
	 -1) "BPGroup",
	 "SlpCode",
	 COALESCE("U_Lat",
	 0) AS "Lat",
	 COALESCE("U_Lng",
	 0) AS "Lng",
	 "CntctPrsn" AS "ContactPerson",
	 "U_DefCur" AS "DefCur",
	 "U_TipoIdentificacion",
	 "LicTradNum" AS "Cedula",
	 "U_provincia",
	 "U_canton",
	 "U_distrito",
	 COALESCE("U_barrio",
	 NULL) "U_barrio",
	 "U_direccion",
	 "U_SubTipo" AS "SubTipo",
	 ( CASE WHEN "CardCode" IN ('C00001',
	 'C00004') 
	THEN CAST(1 AS INT) 
	ELSE CAST(0 AS INT) 
	END ) "CashCustomer",
	 COALESCE("GroupCode",
	 -1) "GroupCode",
	 COALESCE("LicTradNum",
	 '') "LicTradNum",
	 COALESCE("IntrntSite",
	 '') "IntrntSite",
	 COALESCE("Notes",
	 '') "Notes",
	 COALESCE(CAST(0 AS INT),
	 0) AS "ControlSerie",
	 COALESCE('{' || '"Condition": "'|| NULL ||'",' || '"UDFTable":"'|| NULL ||'",' || '"UDFAlias":"'|| NULL ||'",' || '"StrVal":"'|| NULL ||'"' || '}',
	 '{"Condition": "", "UDFTable": "", "UDFAlias":"", "StrVal": ""}') "OTCXCondition",
	 CLVS_D_MLT_SLT_TIMESPAN(CLVS_D_MLT_SLT_DOCFULLDATE(0, COALESCE("UpdateDate", "CreateDate")), COALESCE("UpdateTS", "CreateTS")) AS "UpdateDateTime" 
FROM "OCRD" 
WHERE "CardType" = 'C' 
AND "frozenFor" = 'N' 
AND "validFor" = 'Y' WITH READ ONLY;



--114-----------------------------------------------------------114--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_MOBILECOMPANYINFO_B1SLQuery" ( "CompanyName", "Direction", "Identification", "Phone" ) AS SELECT 
	'DemoCR' AS "CompanyName", 
	"company"."CompnyAddr" AS "Direction",
	REPLACE("company"."RevOffice", '-', '') AS "Identification", 
	"company"."Phone1" AS "Phone"
FROM 
	"OADM" AS "company";



--115-----------------------------------------------------------115--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_MOBILECREDITCARDS_B1SLQuery" ( "CardName", "CreditCard", "AcctCode", "Currency" ) AS ((SELECT	'' AS "CardName",
		0 AS "CreditCard",
		'' AS "AcctCode",
		'##' AS "Currency"
FROM dummy) UNION ALL (SELECT 
	"CreditCard"."CardName",
	"CreditCard"."CreditCard", 
	"CreditCard"."AcctCode",
	"account"."ActCurr" AS "Currency"
FROM "OCRC" AS "CreditCard"
	INNER JOIN "OACT" AS "account"
		ON "account"."AcctCode" = "CreditCard"."AcctCode")) WITH READ ONLY;



--116-----------------------------------------------------------116--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_MOBILEDISCOUNTGROUPS_B1SLQuery" ( "AbsEntry", "Type", "CardCode", "BPGroup", "ItemCode", "ItemGroup", "AuxField", "Discount", "CreateDate", "UpdateDate", "UpdateDateTime" ) AS SELECT
	 "DRG"."AbsEntry",
	 COALESCE(CASE WHEN "OED"."ObjType" = -1 
	AND "DRG"."ObjType" = 52 
	THEN 2 WHEN "OED"."ObjType" = 10 
	AND "DRG"."ObjType" = 52 
	THEN 3 WHEN "OED"."ObjType" = 10 
	AND "DRG"."ObjType" = 4 
	THEN 4 WHEN "OED"."ObjType" = 2 
	AND "DRG"."ObjType" = 52 
	THEN 5 WHEN "OED"."ObjType" = 2 
	AND "DRG"."ObjType" = 4 
	THEN 6 
	ELSE -1 
	END,
	 -1) AS "Type",
	 COALESCE(CASE WHEN "OED"."ObjType" = 2 
	THEN "OED"."ObjCode" 
	ELSE NULL 
	END,
	 '') AS "CardCode",
	 COALESCE(CASE WHEN "OED"."ObjType" = 10 
	THEN "OED"."ObjCode" 
	ELSE 0 
	END,
	 0) AS "BPGroup",
	 COALESCE(CASE WHEN "DRG"."ObjType" = 4 
	THEN "DRG"."ObjKey" 
	ELSE NULL 
	END,
	 '') AS "ItemCode",
	 COALESCE(CASE WHEN "DRG"."ObjType" = 52 
	THEN "DRG"."ObjKey" 
	ELSE 0 
	END,
	 0) AS "ItemGroup",
	 '' AS "AuxField",
	 "DRG"."Discount",
	 CAST(CLVS_D_MLT_SLT_DOCFULLDATE(0, "OED"."CreateDate") AS DATE) AS "CreateDate",
	 CAST(CLVS_D_MLT_SLT_DOCFULLDATE(0, COALESCE("OED"."UpdateDate",
	 "OED"."CreateDate")) AS DATE) AS "UpdateDate",
	 CLVS_D_MLT_SLT_TIMESPAN(CLVS_D_MLT_SLT_DOCFULLDATE(0, COALESCE("OED"."UpdateDate",
	 "OED"."CreateDate")),
	 0) AS "UpdateDateTime" 
FROM "EDG1" AS "DRG" 
INNER JOIN "OEDG" AS "OED" ON "DRG"."AbsEntry" = "OED"."AbsEntry" 
WHERE "DRG"."DiscType" = 'D' WITH READ ONLY;



--117-----------------------------------------------------------117--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_MOBILEITEMSQTY_B1SLQuery" ( "Count" ) AS SELECT COUNT("ItemCode") AS "Count"
FROM "CLVS_D_MLT_SLT_MOBILEITEMS_B1SLQuery" WITH READ ONLY;



--118-----------------------------------------------------------118--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_MOBILEITEMS_B1SLQuery" ( "ItemCode", "ItemName", "TaxCode", "MaxDiscount", "ShortDescription", "GroupCode", "UgpEntry", "SuoMEntry", "PriceUnit", "Family", "Freight", "AllowUnits", "VATLiable", "OTCXCondition", "EvalSystem", "ManBtchNum", "ManSerNum", "BinAbs", "BinCode", "BinWhsCode", "SerialNumber", "SNWhsCode", "SerialBinAbs", "TreeType", "UpdateDateTime" ) AS SELECT
	 DISTINCT IFNULL(ITM."ItemCode",
	 '') AS "ItemCode",
	 IFNULL(ITM."ItemName",
	 '') AS "ItemName",
	 ( SELECT
	 "LnTaxCode" 
	FROM OTCX 
	WHERE "BusArea" = 0 
	AND "StrVal1" = ITM."U_IVA" ) AS "TaxCode",
	 COALESCE(ITM."U_MaxDiscITM",
	 0) AS "MaxDiscount",
	 '' AS "ShortDescription",
	 ITM."ItmsGrpCod" AS "GroupCode",
	 ITM."UgpEntry",
	 --ITM."SuoMEntry",
 '' AS "SuoMEntry",
	 ITM."PriceUnit",
	 ITM."ItemClass" AS "Family",
	 0 AS "Freight",
	 CASE WHEN ITM."UgpEntry"= -1 
THEN NULL 
ELSE "CLVS_D_MLT_SLT_ALLOWUNITITEM"(ITM."ItemCode" ) 
END AS "AllowUnits",
	 CASE WHEN ITM."VATLiable" = 'Y' 
THEN 1 
ELSE 0 
END AS "VATLiable",
	 COALESCE('{' || '"Condition": 19,' || '"UDFTable":"OITM",' || '"UDFAlias":"Tipo",' || '"StrVal":"' || ITM."U_IVA" || '"' || '}',
	 '{"Condition": "", "UDFTable": "", "UDFAlias":"", "StrVal": ""}') AS "OTCXCondition",
	 ITM."ManBtchNum" AS "EvalSystem",
	 CASE ITM."ManBtchNum" WHEN 'Y' 
THEN 'tYES' 
ELSE 'tNO' 
END AS "ManBtchNum",
	 CASE ITM."ManSerNum" WHEN 'Y' 
THEN 'tYES' 
ELSE 'tNO' 
END AS "ManSerNum",
	 CASE WHEN (SBQ."BinAbs" IS NULL 
	AND SRN."DistNumber" IS NOT NULL) 
THEN NULL 
ELSE IBQ."BinAbs" 
END AS "BinAbs",
	 CASE WHEN (SBQ."BinAbs" IS NULL 
	AND SRN."DistNumber" IS NOT NULL) 
THEN NULL 
ELSE BIN."BinCode" 
END AS "BinCode",
	 CASE WHEN (SBQ."BinAbs" IS NULL 
	AND SRN."DistNumber" IS NOT NULL) 
THEN NULL 
ELSE BIN."WhsCode" 
END AS "BinWhsCode",
	 SRN."DistNumber" AS "SerialNumber",
	 SRQ."WhsCode" AS "SNWhsCode",
	 SBQ."BinAbs" AS "SerialBinAbs",
	 ITM."TreeType",
	 CLVS_D_MLT_SLT_TIMESPAN(CLVS_D_MLT_SLT_DOCFULLDATE(0, COALESCE(ITM."UpdateDate",
	 ITM."CreateDate")),
	 COALESCE(ITM."UpdateTS",
	 ITM."CreateTS")) AS "UpdateDateTime" 
FROM "OITM" ITM 
LEFT JOIN( "OIBQ" IBQ JOIN "OBIN" BIN ON IBQ."BinAbs" = BIN."AbsEntry" ) ON ITM."ItemCode" = IBQ."ItemCode" 
AND IBQ."OnHandQty" > 0 
AND ITM."ManBtchNum" = 'N' 
LEFT JOIN ( "OSRQ" SRQ JOIN "OSRN" SRN ON SRQ."MdAbsEntry" = SRN."AbsEntry" 
	LEFT JOIN "OSBQ" SBQ ON SRN."AbsEntry" = SBQ."SnBMDAbs" 
	AND SBQ."OnHandQty" > 0 ) ON ITM."ItemCode" = SRQ."ItemCode" 
AND SRQ."Quantity" > 0 
WHERE (IBQ."BinAbs" = SBQ."BinAbs" 
	OR SBQ."BinAbs" IS NULL) 
AND ITM."frozenFor" = 'N' WITH READ ONLY;



--119-----------------------------------------------------------119--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_MOBILEMEASUREMENTUNITS_B1SLQuery" ( "UgpEntry", "GrupoCod", "GrupoName", "UomEntry", "UomCode", "MeasureUnit", "BaseQty" ) AS SELECT 
	"UG"."UgpEntry",
	"UG"."UgpCode" AS "GrupoCod",
	"UG"."UgpName" AS "GrupoName",
	"UNIT"."UomEntry",
	"UNIT"."UomCode",
	"UNIT"."UomName" AS "MeasureUnit",
	"UG1"."BaseQty"
FROM 
	"OUGP" AS "UG"
JOIN "UGP1" AS "UG1" ON "UG"."UgpEntry" = "UG1"."UgpEntry"
JOIN "OUOM" AS "UNIT" ON "UG1"."UomEntry" = "UNIT"."UomEntry" WITH READ ONLY;



--120-----------------------------------------------------------120--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_MOBILEMEASURMENTUNITS_B1SLQuery" ( "UgpEntry", "GrupoCod", "GrupoName", "UomEntry", "UomCode", "MeasureUnit", "BaseQty" ) AS SELECT
	 "UG"."UgpEntry",
	 "UG"."UgpCode" AS "GrupoCod",
	 "UG"."UgpName" AS "GrupoName",
	 "UNIT"."UomEntry",
	 "UNIT"."UomCode",
	 "UNIT"."UomName" AS "MeasureUnit",
	 "UG1"."BaseQty" 
FROM "OUGP" AS "UG" JOIN "UGP1" AS "UG1" ON "UG"."UgpEntry" = "UG1"."UgpEntry" JOIN "OUOM" AS "UNIT" ON "UG1"."UomEntry" = "UNIT"."UomEntry" WITH READ ONLY;



--121-----------------------------------------------------------121--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_MOBILEPRICELISTSINFO_B1SLQuery" ( "ListName", "ListNum", "BaseNum", "Factor", "GroupCode", "PrimCurr", "UpdateDateTime" ) AS SELECT
	 PLN."ListName" AS "ListName",
	 PLN."ListNum" AS "ListNum",
	 PLN."BASE_NUM" AS "BaseNum",
	 PLN."Factor" AS "Factor",
	 PLN."GroupCode" AS "GroupCode",
	 PLN."PrimCurr" AS "PrimCurr",
	 CLVS_D_MLT_SLT_TIMESPAN(CLVS_D_MLT_SLT_DOCFULLDATE(0, COALESCE(PLN."UpdateDate", PLN."CreateDate")), 0) AS "UpdateDateTime" 
FROM "OPLN" AS PLN 
WHERE PLN."ValidFor" = 'Y' WITH READ ONLY;



--122-----------------------------------------------------------122--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_MOBILEPRICELISTS_B1SLQuery" ( "ItemCode", "PriceList", "Price", "Currency", "UomEntry", "UpdateDateTime" ) AS ((SELECT
	 "ITM"."ItemCode",
	 "TM1"."PriceList",
	 "TM1"."Price",
	 "TM1"."Currency",
	 "TM1"."UomEntry",
	 CLVS_D_MLT_SLT_TIMESPAN(CLVS_D_MLT_SLT_DOCFULLDATE(0, COALESCE("ITM"."UpdateDate",
	 "ITM"."CreateDate")),
	 COALESCE("ITM"."UpdateTS",
	 "ITM"."CreateTS")) AS "UpdateDateTime" 
		FROM "OITM" AS "ITM" 
		INNER JOIN "ITM1" AS "TM1" ON "TM1"."ItemCode" = "ITM"."ItemCode" 
		WHERE "TM1"."Price" > 0 
		AND "TM1"."PriceList" IN ( SELECT
	 "BP"."ListNum" 
			FROM "OCRD" AS "BP" 
			WHERE "BP"."frozenFor"='N' 
			AND "BP"."validFor"='Y' 
			GROUP BY "BP"."ListNum")) UNION ALL (SELECT
	 "TM9"."ItemCode",
	 "TM9"."PriceList",
	 "TM9"."Price",
	 "TM9"."Currency",
	 "TM9"."UomEntry",
	 CLVS_D_MLT_SLT_TIMESPAN(CLVS_D_MLT_SLT_DOCFULLDATE(0, COALESCE("ITM"."UpdateDate",
	 "ITM"."CreateDate")),
	 COALESCE("ITM"."UpdateTS",
	 "ITM"."CreateTS")) AS "UpdateDateTime" 
		FROM "OITM" AS "ITM" 
		INNER JOIN "ITM9" AS "TM9" ON "TM9"."ItemCode" = "ITM"."ItemCode")) WITH READ ONLY;



--123-----------------------------------------------------------123--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_MOBILEPRINTDOCTYPELABELS_B1SLQuery" ( "DocType", "Label" ) AS ((((((SELECT
	1 AS "DocType",
	'Credito' AS "Label"
FROM
	DUMMY) UNION ALL (SELECT
	3 AS "DocType",
	'Reserva' AS "Label"
FROM
	DUMMY)) UNION ALL (SELECT 
	4 AS "DocType",
	'Orden' AS "Label"
FROM
	DUMMY)) UNION ALL (SELECT
	5 AS "DocType",
	'Contado' AS "Label"
FROM
	DUMMY)) UNION ALL (SELECT
	10 AS "DocType",
	'Entrega' AS "Label"
FROM
	DUMMY)) UNION ALL (SELECT 
	8 AS "DocType",
	'Oferta' AS "Label"
FROM
	DUMMY)) WITH READ ONLY;



--124-----------------------------------------------------------124--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_MOBILESALESTAXCODES_B1SLQuery" ( "Code", "Rate" ) AS SELECT
	SalesTaxCodes."Code" AS "Code",
	SalesTaxCodes."Rate" AS "Rate"
FROM
	OSTC SalesTaxCodes
WHERE
	SalesTaxCodes."Lock" = 'N';



--125-----------------------------------------------------------125--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_MOBILETAXCODEDETERS_B1SLQuery" ( "DocEntry", "LineNum", "DocType", "BusArea", "Cond1", "UDFTable1", "NumVal1", "StrVal1", "MnyVal1", "Cond2", "UDFTable2", "NumVal2", "StrVal2", "MnyVal2", "Cond3", "UdfTable3", "NumVal3", "StrVal3", "MnyVal3", "Cond4", "UdfTable4", "NumVal4", "StrVal4", "MnyVal4", "Cond5", "UdfTable5", "NumVal5", "StrVal5", "MnyVal5", "Descr", "LnTaxCode", "FrLnTax", "FrHdrTax", "UDFAlias1", "UDFAlias2", "UDFAlias3", "UDFAlias4", "UDFAlias5" ) AS SELECT 
	"DocEntry",
    "LineNum",
    "DocType",
    "BusArea",
    "Cond1",
    "UDFTable1",
    COALESCE("NumVal1",0) AS "NumVal1",
    "StrVal1",
    COALESCE("MnyVal1",0) AS "MnyVal1",
    "Cond2",
    "UDFTable2",
    COALESCE("NumVal2",0) AS "NumVal2",
    "StrVal2",
    COALESCE("MnyVal2",0) AS "MnyVal2",
    "Cond3",
    "UdfTable3",
    COALESCE("NumVal3",0) AS "NumVal3",
    "StrVal3",
    COALESCE("MnyVal3",0) AS "MnyVal3",
    "Cond4",
    "UdfTable4",
    COALESCE("NumVal4",0) AS "NumVal4",
    "StrVal4",
    COALESCE("MnyVal4",0) AS "MnyVal4",
    "Cond5",
    "UdfTable5",
    COALESCE("NumVal5",0) AS "NumVal5",
    "StrVal5",
    COALESCE("MnyVal5",0) AS "MnyVal5",
    "Descr",
    "LnTaxCode",
    "FrLnTax",
    "FrHdrTax",
    "UDFAlias1",
    "UDFAlias2",
    "UDFAlias3",
    "UDFAlias4",
    "UDFAlias5"
FROM
	OTCX;



--126-----------------------------------------------------------126--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_MOBILEWAREHOUSES_B1SLQuery" ( "WhsCode", "WhsName" ) AS SELECT
    "WhsCode",
    "WhsName"
FROM
    "OWHS";



--127-----------------------------------------------------------127--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_NUMFEONLINE_B1SLQuery" ( "DocNum", "DocEntry", "TipoDoc", "NumFE", "ClaveFE" ) AS SELECT
	"oinv"."DocNum",
	"oinv"."DocEntry",
	"fe"."U_TipoDoc" AS "TipoDoc",
	"fe"."U_NConsecFE" AS "NumFE",
	"fe"."U_NClaveFE" AS "ClaveFE"
FROM 
	"OINV" AS "oinv"
INNER JOIN 
	"@NCLAVEFE" AS "fe" 
ON 
	TO_VARCHAR("oinv"."DocEntry") = TO_VARCHAR("fe"."U_DocEntry") WITH READ ONLY;



--128-----------------------------------------------------------128--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_OITM_STOCK" ( "ItemCode", "WhsCode", "OnHand", "Type", "AvgPrice" ) AS SELECT
    "ItemCode",
    "WhsCode",
    CASE WHEN ("OnHand" - "IsCommited") > 0 THEN ("OnHand" - "IsCommited") ELSE 0 END AS "OnHand",
    1 AS "Type",
    "AvgPrice"
FROM "OITW";



--129-----------------------------------------------------------129--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_ORDERTOPRINT_B1SLQuery" ( "CardCode", "CardName", "DocCurrency", "FederalTaxID", "Phone", "DocEntry", "DocDate", "DocNum", "DocTotal", "SalesPerson", "ItemName", "Tax", "Quantity", "DiscountPercent", "TaxRate", "UnitPrice", "Discount", "Currency", "LineTotal" ) AS SELECT
	 SalesOrder."CardCode",
	 SalesOrder."CardName",
	 SalesOrder."DocCur" AS "DocCurrency",
	 COALESCE(BusinessPartner."LicTradNum",
	 '---') AS "FederalTaxID",
	 COALESCE(BusinessPartner."Phone1",
	 '---') AS "Phone",
	 SalesOrder."DocEntry",
	 SalesOrder."DocDate",
	 SalesOrder."DocNum",
	 CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY(SalesOrder."DocCur") = 1 
THEN SalesOrder."DocTotal" 
ELSE SalesOrder."DocTotalFC" 
END AS "DocTotal",
	 COALESCE(SalesPerson."SlpName",
	 '---') AS "SalesPerson",

	 CASE WHEN  SalesOrderRows."UomEntry" > -1 
THEN  CONCAT(SalesOrderRows."Dscription", ' - [' || SalesOrderRows."UomCode" || ']') 
ELSE SalesOrderRows."Dscription"
END AS "ItemName",
	 
	 CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY(SalesOrder."DocCur") = 1 
THEN SalesOrderRows."VatSum" 
ELSE SalesOrderRows."VatSumSy" 
END AS "Tax",
	 SalesOrderRows."Quantity",
	 SalesOrderRows."DiscPrcnt" AS "DiscountPercent",
	 SalesOrderRows."VatPrcnt" AS "TaxRate",
	 SalesOrderRows."PriceBefDi" AS "UnitPrice",
	 (SalesOrderRows."PriceBefDi" - SalesOrderRows."Price") AS "Discount",
	 SalesOrderRows."Currency" AS "Currency",
	 CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY(SalesOrder."DocCur") = 1 
THEN SalesOrderRows."LineTotal" 
ELSE SalesOrderRows."TotalFrgn" 
END AS "LineTotal" 
FROM ORDR AS SalesOrder 
INNER JOIN RDR1 AS SalesOrderRows ON SalesOrder."DocEntry" = SalesOrderRows."DocEntry" 
INNER JOIN OCRD AS BusinessPartner ON SalesOrder."CardCode" = BusinessPartner."CardCode" 
INNER JOIN OSLP AS SalesPerson ON SalesOrder."SlpCode" = SalesPerson."SlpCode" WITH READ ONLY;



--130-----------------------------------------------------------130--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_ORDER_DETAILTRANSAC" ( "DocEntry", "SysNumber", "DistNumber", "ItemCode", "MdAbsEntry", "AbsEntry", "Quantity", "DocLine", "BinAbs" ) AS SELECT
    InventoryTransactionsLog."DocEntry" AS "DocEntry",
    BatchDetailsTransac."SysNumber" AS "SysNumber",
    SerialNumbers."DistNumber" AS "DistNumber",
    SerialNumbers."ItemCode" AS "ItemCode",
    BatchDetailsTransac."MdAbsEntry",
    SerialNumbers."AbsEntry",
    SerialNumbers."Quantity",
    InventoryTransactionsLog."DocLine",
    COALESCE(Bin."BinAbs", 0) AS "BinAbs"
FROM "OITL" AS InventoryTransactionsLog
INNER JOIN "ITL1" AS BatchDetailsTransac
    ON InventoryTransactionsLog."LogEntry" = BatchDetailsTransac."LogEntry"
    AND InventoryTransactionsLog."DocType" = '17'
INNER JOIN "OSRN" AS SerialNumbers
    ON BatchDetailsTransac."MdAbsEntry" = SerialNumbers."AbsEntry"
LEFT JOIN "OSBQ" AS Bin
    ON SerialNumbers."AbsEntry" = Bin."SnBMDAbs" WITH READ ONLY;



--131-----------------------------------------------------------131--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_OUTGOINGPAY_B1SLQuery" ( "DocNum", "DocEntry", "CardName", "Comments", "DocDate", "DocDateOrder", "DocNumDefault" ) AS SELECT
	 "DocNum",
	 "DocEntry",
	 "CardName",
	 "Comments",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime", "DocDate") AS "DocDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime", "DocDate") AS "DocDateOrder",
	 0 AS "DocNumDefault" 
FROM "OVPM";



--132-----------------------------------------------------------132--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_OUTPUTINVENTORY_B1SLQuery" ( "DocNum", "DocEntry", "CardName", "Comments", "DocDate", "DocDateOrder", "DocNumDefault" ) AS SELECT
	 "DocNum",
	 "DocEntry",
	 "CardName",
	 "Comments",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime", "DocDate") AS "DocDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime", "DocDate") AS "DocDateOrder",
	 0 AS "DocNumDefault" 
FROM "OIGE";



--133-----------------------------------------------------------133--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_PAISES_B1SLQuery" ( "Code", "Name" ) AS SELECT
	"Code" AS "Code",
	"Name" AS "Name"
FROM 
	"OCRY";



--134-----------------------------------------------------------134--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_PAYRECEIVED_B1SLQuery" ( "DocEntry", "DocNum", "DocumentType", "CardCode", "CardName", "NumAtCard", "DocCurrency", "DocCurrencyDefault", "DocDate", "DocDueDate", "DocDateFilter", "Total", "TotalUSD", "Saldo", "SaldoUSD", "InstlmntID", "TransId", "ObjType" ) AS ((SELECT
	 "T1"."DocEntry" ,
	 "T1"."DocNum" ,
	 "T1"."DocumentType" ,
	 "T1"."CardCode" ,
	 "T1"."CardName" ,
	 "T1"."NumAtCard" ,
	 "T1"."DocCurrency" ,
	 "T1"."DocCurrencyDefault" ,
	 "T1"."DocDate" ,
	 "T1"."DocDueDate" ,
	 "T1"."DocDateFilter" ,
	 "T1"."Total" ,
	 "T1"."TotalUSD" ,
	 "T1"."Saldo" ,
	 "T1"."SaldoUSD" ,
	 "T1"."InstlmntID" ,
	 "T1"."TransId" ,
	 "T1"."ObjType" 
		FROM ( SELECT
	 ARDownPayment."DocEntry",
	 ARDownPayment."DocNum",
	 'Anticipo' AS "DocumentType",
	 ARDownPayment."CardCode",
	 ARDownPayment."CardName",
	 ARDownPayment."NumAtCard",
	 ARDownPayment."DocCur" AS "DocCurrency",
	 '' AS "DocCurrencyDefault",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime", "DocDate") AS "DocDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime", "DocDate") AS "DocDueDate",
	 CAST(ARDownPayment."DocDate" AS DATE) AS "DocDateFilter",
	 COALESCE(ARDownPaymentInstallments."InsTotal",
	 0) AS "Total",
	 COALESCE(ARDownPaymentInstallments."InsTotalFC",
	 0) AS "TotalUSD",
	 COALESCE(ARDownPaymentInstallments."InsTotal" - ARDownPaymentInstallments."PaidToDate",
	 0) AS "Saldo",
	 COALESCE(ARDownPaymentInstallments."InsTotalFC" - ARDownPaymentInstallments."PaidFC",
	 0) AS "SaldoUSD",
	 ARDownPaymentInstallments."InstlmntID",
	 ARDownPayment."TransId",
	 ARDownPayment."ObjType" 
			FROM "ODPI" ARDownPayment 
			INNER JOIN "DPI6" ARDownPaymentInstallments ON ARDownPayment."DocEntry" = ARDownPaymentInstallments."DocEntry" 
			WHERE ARDownPayment."DocStatus"='O' 
			ORDER BY "DocumentType" ASC,
	 "DocEntry" DESC ) AS T1) UNION ALL (SELECT
	 "T2"."DocEntry" ,
	 "T2"."DocNum" ,
	 "T2"."DocumentType" ,
	 "T2"."CardCode" ,
	 "T2"."CardName" ,
	 "T2"."NumAtCard" ,
	 "T2"."DocCurrency" ,
	 "T2"."DocCurrencyDefault" ,
	 "T2"."DocDate" ,
	 "T2"."DocDueDate" ,
	 "T2"."DocDateFilter" ,
	 "T2"."Total" ,
	 "T2"."TotalUSD" ,
	 "T2"."Saldo" ,
	 "T2"."SaldoUSD" ,
	 "T2"."InstlmntID" ,
	 "T2"."TransId" ,
	 "T2"."ObjType" 
		FROM ( SELECT
	 "Invoice"."DocEntry",
	 "Invoice"."DocNum",
	 CASE "Invoice"."DocSubType" WHEN 'DN' 
			THEN ' Nota de débito' 
			ELSE 'Factura' 
			END AS "DocumentType",
	 "Invoice"."CardCode",
	 "Invoice"."CardName",
	 "Invoice"."NumAtCard",
	 "Invoice"."DocCur" AS "DocCurrency",
	 '' AS "DocCurrencyDefault",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime", "DocDate") AS "DocDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime", "DocDate") AS "DocDueDate",
	 CAST("Invoice"."DocDate" AS DATE) AS "DocDateFilter",
	 COALESCE("ARInvoiceInstallments"."InsTotal",
	 0) AS "Total",
	 COALESCE("ARInvoiceInstallments"."InsTotalFC",
	 0) AS "TotalUSD",
	 COALESCE("ARInvoiceInstallments"."InsTotal" - "ARInvoiceInstallments"."PaidToDate",
	 0) AS "Saldo",
	 COALESCE("ARInvoiceInstallments"."InsTotalFC" - "ARInvoiceInstallments"."PaidFC",
	 0) AS "SaldoUSD",
	 "ARInvoiceInstallments"."InstlmntID",
	 "Invoice"."TransId",
	 "Invoice"."ObjType" 
			FROM "OINV" "Invoice" 
			INNER JOIN "INV6" "ARInvoiceInstallments" ON "Invoice"."DocEntry" = "ARInvoiceInstallments"."DocEntry" 
			WHERE "Invoice"."DocStatus"='O' 
			ORDER BY "DocumentType" ASC,
	 "DocEntry" DESC ) AS T2)) WITH READ ONLY;



--135-----------------------------------------------------------135--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_PAYTERMS_B1SLQuery" ( "GroupNum", "PymntGroup", "Type", "Months", "Days" ) AS SELECT
	 "GroupNum",
	 "PymntGroup",
	 CASE WHEN "GroupNum" = -1 
OR "GroupNum" = 5 
THEN '2' 
ELSE '1' 
END AS "Type",
	 "ExtraMonth" AS "Months",
	 "ExtraDays" AS "Days" 
FROM "OCTG";



--136-----------------------------------------------------------136--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_PRETOPRINT_B1SLQuery" ( "CardCode", "CardName", "DocCurrency", "FederalTaxID", "Phone", "DocEntry", "DocDate", "DocNum", "DocTotal", "SalesPerson", "ItemName", "Tax", "Quantity", "DiscountPercent", "TaxRate", "UnitPrice", "Discount", "Currency", "LineTotal" ) AS SELECT
	 Preliminar."CardCode",
	 Preliminar."CardName",
	 Preliminar."DocCur" AS "DocCurrency",
	 COALESCE(BusinessPartner."LicTradNum",
	'---') AS "FederalTaxID",
	 COALESCE(BusinessPartner."Phone1",
	'---') AS "Phone",
	 Preliminar."DocEntry",
	 Preliminar."DocDate",
	 Preliminar."DocNum",
	 (
		CASE 
				WHEN "CLVS_D_MLT_SLT_ISLOCALCURRENCY"(Preliminar."DocCur") = 1 THEN Preliminar."DocTotal"
				ELSE Preliminar."DocTotalFC"
			END
		) AS "DocTotal",
		COALESCE(SalesPerson."SlpName",'---') AS "SalesPerson",
		( 
			CASE
			    WHEN PreliminarRows."UomEntry" > -1 
			    THEN  CONCAT(PreliminarRows."Dscription",CONCAT( CONCAT(' - [',PreliminarRows."UomCode"),']'))
				ELSE PreliminarRows."Dscription"
			END
		) AS "ItemName",
	 CASE WHEN "CLVS_D_MLT_SLT_ISLOCALCURRENCY"(Preliminar."DocCur") = 1 
THEN PreliminarRows."VatSum" 
ELSE PreliminarRows."VatSumSy" 
END AS "Tax",
	 PreliminarRows."Quantity",
	 PreliminarRows."DiscPrcnt" AS "DiscountPercent",
	 PreliminarRows."VatPrcnt" AS "TaxRate",
	 PreliminarRows."PriceBefDi" AS "UnitPrice",
	 (PreliminarRows."PriceBefDi" - PreliminarRows."Price") AS "Discount",
	 PreliminarRows."Currency" AS "Currency",
	 CASE WHEN "CLVS_D_MLT_SLT_ISLOCALCURRENCY"(Preliminar."DocCur") = 1 
THEN PreliminarRows."LineTotal" 
ELSE PreliminarRows."TotalFrgn" 
END AS "LineTotal" 
FROM "ODRF" AS Preliminar 
INNER JOIN "DRF1" PreliminarRows ON Preliminar."DocEntry" = PreliminarRows."DocEntry" 
INNER JOIN "OCRD" BusinessPartner ON Preliminar."CardCode" = BusinessPartner."CardCode" 
INNER JOIN "OSLP" SalesPerson ON Preliminar."SlpCode" = SalesPerson."SlpCode" WITH READ ONLY;



--137-----------------------------------------------------------137--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_PRICELIST_B1SLQuery" ( "ListNum", "ListName", "PrimCurr", "AddCurr1", "AddCurr2" ) AS SELECT 
	"ListNum", "ListName", "PrimCurr", "AddCurr1", "AddCurr2"
FROM "OPLN" PL
WHERE PL."ValidFor" = 'Y';



--138-----------------------------------------------------------138--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_PRICELIST_BY_COMPANY_CURRENCY" ( "ListName", "ListNum", "PrimCurr", "MainCurncy" ) AS SELECT
	 curr."ListName",
	 curr."ListNum",
	 curr."PrimCurr",
	 AD."MainCurncy" 
FROM "OPLN" curr 
LEFT JOIN "OADM" AD ON AD."MainCurncy" = curr."PrimCurr" WHERE curr."ValidFor"='Y' WITH READ ONLY;



--139-----------------------------------------------------------139--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_PRICELIST_INVENTORY_B1SLQuery" ( "ListNum", "ListName", "PrimCurr", "AddCurr1", "AddCurr2" ) AS SELECT
	 "ListNum",
	 "ListName",
	 "PrimCurr",
	 "AddCurr1",
	 "AddCurr2" 
FROM "OPLN" PL 
WHERE PL."ValidFor" = 'Y';



--140-----------------------------------------------------------140--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_PRICELIST_PURCHASE_B1SLQuery" ( "ListNum", "ListName", "PrimCurr", "AddCurr1", "AddCurr2" ) AS SELECT
	 "ListNum",
	 "ListName",
	 "PrimCurr",
	 "AddCurr1",
	 "AddCurr2" 
FROM "OPLN" PL 
WHERE PL."ValidFor" = 'Y';



--141-----------------------------------------------------------141--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_PRICELIST_SALES_B1SLQuery" ( "ListNum", "ListName", "PrimCurr", "AddCurr1", "AddCurr2" ) AS SELECT
	 "ListNum",
	 "ListName",
	 "PrimCurr",
	 "AddCurr1",
	 "AddCurr2" 
FROM "OPLN" PL 
WHERE PL."ValidFor" = 'Y';



--142-----------------------------------------------------------142--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_PRINTDOCUMENTTOZPL_B1SLQuery" ( "CardCode", "CardName", "Phone1", "E_Mail", "DocDate", "DocCurrency", "DocCurrencyInv", "DocNumInv", "DocEntryPay", "DocNumPay", "CashSum", "TransferSum", "CreditSum", "DocTotal", "DocTotalInv" ) AS SELECT  
	BusinessPartners."CardCode",
	BusinessPartners."CardName",
	COALESCE(BusinessPartners."Phone1", '') AS "Phone1",
	COALESCE(BusinessPartners."E_Mail", '') AS "E_Mail",
	IncomingPayments."DocDate" AS "DocDate",
	IncomingPayments."DocCurr" AS "DocCurrency",
	Invoices."DocCur" AS "DocCurrencyInv",
	COALESCE(Invoices."DocNum", 0) AS "DocNumInv",
	COALESCE(IncomingPayments."DocEntry", 0) AS "DocEntryPay",
	COALESCE(IncomingPayments."DocNum", 0) AS "DocNumPay",
	COALESCE(
		CASE 
			WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY(IncomingPayments."DocCurr") = 1 THEN IncomingPayments."CashSum"
			ELSE IncomingPayments."CashSumFC"
		END,
		0
	) AS "CashSum",
	COALESCE(
		CASE 
			WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY(IncomingPayments."DocCurr") = 1 THEN IncomingPayments."TrsfrSum"
			ELSE IncomingPayments."TrsfrSumFC"
		END,
		0
	) AS "TransferSum",
	COALESCE(CreditVoucherTotal."CreditSum", 0) AS "CreditSum",
	COALESCE(
		CASE 
			WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY(IncomingPayments."DocCurr") = 1 THEN IncomingPayments."DocTotal"
			ELSE IncomingPayments."DocTotalFC"
		END,
		0
	) AS "DocTotal",
	COALESCE(
		CASE 
			WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY(Invoices."DocCur") = 1 THEN Invoices."DocTotal"
			ELSE Invoices."DocTotalFC"
		END,
		0
	) AS "DocTotalInv"
FROM "ORCT" IncomingPayments
INNER JOIN "OCRD" BusinessPartners
	ON IncomingPayments."CardCode" = BusinessPartners."CardCode"
LEFT JOIN "RCT2" IncomingPaymentInvoices
	ON IncomingPaymentInvoices."DocNum" = IncomingPayments."DocEntry"
LEFT JOIN "OINV" Invoices
	ON IncomingPaymentInvoices."DocEntry" = Invoices."DocEntry"
LEFT JOIN "CLVS_D_MLT_SLT_CREDITSUM" AS CreditVoucherTotal
	ON IncomingPayments."DocEntry" = CreditVoucherTotal."DocEntry" WITH READ ONLY;



--143-----------------------------------------------------------143--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_PROVINCIAS_B1SLQuery" ( "Value", "Description", "IsActive" ) AS (((((((SELECT '01' AS "Value", 'San Jose' AS "Description", 1 AS "IsActive" FROM DUMMY) UNION ALL (SELECT '02' AS "Value", 'Alajuela' AS "Description", 1 AS "IsActive" FROM DUMMY)) UNION ALL (SELECT '03' AS "Value", 'Cartago' AS "Description", 1 AS "IsActive" FROM DUMMY)) UNION ALL (SELECT '04' AS "Value", 'Heredia' AS "Description", 1 AS "IsActive" FROM DUMMY)) UNION ALL (SELECT '05' AS "Value", 'Guanacaste' AS "Description", 1 AS "IsActive" FROM DUMMY)) UNION ALL (SELECT '06' AS "Value", 'Puntarenas' AS "Description", 1 AS "IsActive" FROM DUMMY)) UNION ALL (SELECT '07' AS "Value", 'Limon' AS "Description", 1 AS "IsActive" FROM DUMMY)) WITH READ ONLY;



--144-----------------------------------------------------------144--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_PURCHASEDELIVERYNOTES_B1SLQuery" ( "DocEntry", "DocNum", "CardCode", "CardName", "Comments", "SalesPersonCode", "TaxDate", "DocDueDate", "DocDate", "DocDateOrder", "DocDateFilter", "PriceList", "DocTotal", "DocCurrency", "DocStatus", "DocStatusDefault", "CardCodeDefault", "CardNameDefault", "SlpCodeDefault", "DocNumDefault" ) AS SELECT
	 "DocEntry",
	 "DocNum",
	 "CardCode",
	 "CardName",
	 "Comments",
	 "SlpCode" AS "SalesPersonCode",
	 CAST("TaxDate" AS DATE) AS "TaxDate",
	 CAST("DocDueDate" AS DATE) AS "DocDueDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime", "DocDate") AS "DocDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime", "DocDate") AS "DocDateOrder",
	 "DocDate" AS "DocDateFilter",
	  COALESCE("U_ListNum",0) AS "PriceList",
	 CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY("DocCur") = 1 
THEN "DocTotal" 
ELSE "DocTotalFC" 
END AS "DocTotal",
	 "DocCur" AS "DocCurrency",
	 "DocStatus",
	 'ALL' AS "DocStatusDefault",
	 '' AS "CardCodeDefault",
	 '' AS "CardNameDefault",
	 0 AS "SlpCodeDefault",
	 0 AS "DocNumDefault" 
FROM "OPDN" PurchaseDelivery WITH READ ONLY;



--145-----------------------------------------------------------145--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_PURCHASEINVOICEROWS_B1SLQuery" ( "LineNum", "LineStatus", "DocEntry", "ItemCode", "ItemDescription", "UnitPrice", "Quantity", "DiscountPercent", "WarehouseCode", "TaxCode", "TaxRate", "UoMEntry", "TaxOnly", "WhsName", "Currency", "VATLiable" ) AS SELECT
	 PurchaseInvoiceRows."LineNum",
	 PurchaseInvoiceRows."LineStatus",
	 PurchaseInvoiceRows."DocEntry",
	 PurchaseInvoiceRows."ItemCode",
	 PurchaseInvoiceRows."Dscription" AS "ItemDescription",
	 COALESCE(PurchaseInvoiceRows."PriceBefDi",
	 0) AS "UnitPrice",
	 PurchaseInvoiceRows."Quantity",
	 COALESCE(PurchaseInvoiceRows."DiscPrcnt",
	 0) AS "DiscountPercent",
	 PurchaseInvoiceRows."WhsCode" AS "WarehouseCode",
	 PurchaseInvoiceRows."TaxCode",
	 CLVS_D_MLT_SLT_TAXRATE(PurchaseInvoiceRows."TaxCode") AS "TaxRate",
	 PurchaseInvoiceRows."UomEntry" AS "UoMEntry",
	 PurchaseInvoiceRows."TaxOnly",
	 Warehouse."WhsName",
	 PurchaseInvoiceRows."Currency",
	 (CAST(
			CASE 
				WHEN PurchaseInvoiceRows."TaxStatus" = 'Y' THEN 1
				ELSE 0
			END AS INT)
		)AS "VATLiable" 
FROM "PCH1" PurchaseInvoiceRows 
LEFT JOIN "OWHS" AS Warehouse ON PurchaseInvoiceRows."WhsCode" = Warehouse."WhsCode" WITH READ ONLY;



--146-----------------------------------------------------------146--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_PURCHASEINVOICE_B1SLQuery" ( "DocEntry", "DocNum", "CardCode", "CardName", "Comments", "SalesPersonCode", "TaxDate", "DocDueDate", "DocDate", "DocDateOrder", "DocDateFilter", "PaymentGroupCode", "PriceList", "DocTotal", "DocCurrency", "DocStatus", "AttachmentEntry", "DocStatusDefault", "CardCodeDefault", "CardNameDefault", "SlpCodeDefault", "DocNumDefault" ) AS SELECT
	 "DocEntry",
	 "DocNum",
	 "CardCode",
	 "CardName",
	 "Comments",
	 "SlpCode" AS "SalesPersonCode",
	 CAST("TaxDate" AS DATE) AS "TaxDate",
	 CAST("DocDueDate" AS DATE) AS "DocDueDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime", "DocDate") AS "DocDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime", "DocDate") AS "DocDateOrder",
	 "DocDate" AS "DocDateFilter",
	 "GroupNum" AS "PaymentGroupCode",
	 COALESCE("U_ListNum",
	 0) AS "PriceList",
	 CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY("DocCur") = 1 
THEN "DocTotal" 
ELSE "DocTotalFC" 
END AS "DocTotal",
	 "DocCur" AS "DocCurrency",
	 "DocStatus",
	 "AtcEntry" AS "AttachmentEntry",
	 'ALL' AS "DocStatusDefault",
	 '' AS "CardCodeDefault",
	 '' AS "CardNameDefault",
	 0 AS "SlpCodeDefault",
	 0 AS "DocNumDefault" 
FROM "OPCH" PurchaseInvoice WITH READ ONLY;



--147-----------------------------------------------------------147--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_PURCHASEORDERROWS_B1SLQuery" ( "LineNum", "LineStatus", "DocEntry", "ItemCode", "ItemDescription", "UnitPrice", "Quantity", "DiscountPercent", "WarehouseCode", "TaxCode", "TaxRate", "UoMEntry", "TaxOnly", "WhsName", "Currency", "VATLiable" ) AS SELECT
	 PurchaseOrderRows."LineNum",
	 PurchaseOrderRows."LineStatus",
	 PurchaseOrderRows."DocEntry",
	 PurchaseOrderRows."ItemCode",
	 PurchaseOrderRows."Dscription" AS "ItemDescription",
	 COALESCE(PurchaseOrderRows."PriceBefDi",
	 0) AS "UnitPrice",
	 PurchaseOrderRows."Quantity",
	 COALESCE(PurchaseOrderRows."DiscPrcnt",
	 0) AS "DiscountPercent",
	 PurchaseOrderRows."WhsCode" AS "WarehouseCode",
	 PurchaseOrderRows."TaxCode",
	 CLVS_D_MLT_SLT_TAXRATE(PurchaseOrderRows."TaxCode") AS "TaxRate",
	 PurchaseOrderRows."UomEntry" AS "UoMEntry",
	 PurchaseOrderRows."TaxOnly",
	 Warehouse."WhsName",
	 PurchaseOrderRows."Currency",
	 (CAST(
			CASE 
				WHEN PurchaseOrderRows."TaxStatus" = 'Y' THEN 1
				ELSE 0
			END AS INT)
		)AS "VATLiable" 
FROM "POR1" PurchaseOrderRows 
LEFT JOIN "OWHS" AS Warehouse ON PurchaseOrderRows."WhsCode" = Warehouse."WhsCode" WITH READ ONLY;



--148-----------------------------------------------------------148--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_PURCHASEORDER_B1SLQuery" ( "DocEntry", "DocNum", "CardCode", "CardName", "Comments", "SalesPersonCode", "TaxDate", "DocDueDate", "DocDate", "DocDateOrder", "DocDateFilter", "PriceList", "DocTotal", "DocCurrency", "DocStatus", "DocStatusDefault", "CardCodeDefault", "CardNameDefault", "SlpCodeDefault", "DocNumDefault", "AttachmentEntry" ) AS SELECT
	 "DocEntry",
	 "DocNum",
	 "CardCode",
	 "CardName",
	 "Comments",
	 "SlpCode" AS "SalesPersonCode",
	 CAST("TaxDate" AS DATE) AS "TaxDate",
	 CAST("DocDueDate" AS DATE) AS "DocDueDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime",
	 "DocDate") AS "DocDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime", "DocDate") AS "DocDateOrder",
	 "DocDate" AS "DocDateFilter",
	 COALESCE("U_ListNum",
	 0) AS "PriceList",
	 CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY("DocCur") = 1 
THEN "DocTotal" 
ELSE "DocTotalFC" 
END AS "DocTotal",
	 "DocCur" AS "DocCurrency",
	 "DocStatus",
	 'ALL' AS "DocStatusDefault",
	 '' AS "CardCodeDefault",
	 '' AS "CardNameDefault",
	 0 AS "SlpCodeDefault",
	 0 AS "DocNumDefault" ,
	 "AtcEntry" as "AttachmentEntry" 
FROM "OPOR" PurchaseOrder WITH READ ONLY;



--149-----------------------------------------------------------149--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_PURCHASERETURNROWS_B1SLQUERY" ( "LineNum", "LineStatus", "DocEntry", "ItemCode", "ItemDescription", "UnitPrice", "Quantity", "DiscountPercent", "WarehouseCode", "TaxCode", "TaxRate", "UoMEntry", "TaxOnly", "WhsName", "Currency", "VATLiable" ) AS SELECT
	 PurchaseReturnRows."LineNum",
	 PurchaseReturnRows."LineStatus",
	 PurchaseReturnRows."DocEntry",
	 PurchaseReturnRows."ItemCode",
	 PurchaseReturnRows."Dscription" AS "ItemDescription",
	 COALESCE(PurchaseReturnRows."PriceBefDi",
	 0) AS "UnitPrice",
	 PurchaseReturnRows."Quantity",
	 COALESCE(PurchaseReturnRows."DiscPrcnt",
	 0) AS "DiscountPercent",
	 PurchaseReturnRows."WhsCode" AS "WarehouseCode",
	 PurchaseReturnRows."TaxCode",
	 CLVS_D_MLT_SLT_TAXRATE(PurchaseReturnRows."TaxCode") AS "TaxRate",
	 PurchaseReturnRows."UomEntry" AS "UoMEntry",
	 PurchaseReturnRows."TaxOnly",
	 Warehouse."WhsName",
	 PurchaseReturnRows."Currency",
	 (CAST(
			CASE 
				WHEN PurchaseReturnRows."TaxStatus" = 'Y' THEN 1
				ELSE 0
			END AS INT)
		)AS "VATLiable" 
FROM "RPD1" PurchaseReturnRows 
LEFT JOIN "OWHS" Warehouse ON PurchaseReturnRows."WhsCode" = Warehouse."WhsCode" WITH READ ONLY;



--150-----------------------------------------------------------150--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_PURCHASERETURN_B1SLQuery" ( "DocEntry", "DocNum", "CardCode", "CardName", "Comments", "SalesPersonCode", "DocDueDate", "DocDate", "DocDateOrder", "DocDateFilter", "PriceList", "DocTotal", "DocCurrency", "DocStatus", "DocStatusDefault", "CardCodeDefault", "CardNameDefault", "SlpCodeDefault", "DocNumDefault", "TaxDate", "AttachmentEntry" ) AS SELECT
	 "DocEntry",
	 "DocNum",
	 "CardCode",
	 "CardName",
	 "Comments",
	 "SlpCode" AS "SalesPersonCode",
	 CAST(PurchaseReturn."DocDueDate" AS DATE) AS "DocDueDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime",
	 "DocDate") AS "DocDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime", "DocDate") AS "DocDateOrder",
	 "DocDate" AS "DocDateFilter",
	 COALESCE("U_ListNum",
	 0) AS "PriceList",
	 CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY("DocCur") = 1 
THEN "DocTotal" 
ELSE "DocTotalFC" 
END AS "DocTotal",
	 "DocCur" AS "DocCurrency",
	 "DocStatus",
	 'ALL' AS "DocStatusDefault",
	 '' AS "CardCodeDefault",
	 '' AS "CardNameDefault",
	 0 AS "SlpCodeDefault",
	 0 AS "DocNumDefault",
	 CAST("TaxDate" AS DATE) as "TaxDate" ,
	 PurchaseReturn."AtcEntry" AS "AttachmentEntry" 
FROM "ORPD" PurchaseReturn WITH READ ONLY;



--151-----------------------------------------------------------151--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_QUOTATIONTOPRINT_B1SLQuery" ( "CardCode", "CardName", "DocCurrency", "FederalTaxID", "Phone", "DocEntry", "DocDate", "DocNum", "DocTotal", "SalesPerson", "ItemName", "Tax", "Quantity", "DiscountPercent", "TaxRate", "UnitPrice", "Discount", "Currency", "LineTotal" ) AS SELECT
	SalesQuotation."CardCode",
	SalesQuotation."CardName",
	SalesQuotation."DocCur" AS "DocCurrency",
	COALESCE(BusinessPartner."LicTradNum",'---') AS "FederalTaxID",
	COALESCE(BusinessPartner."Phone1",'---') AS "Phone",
	SalesQuotation."DocEntry",
	SalesQuotation."DocDate",
	SalesQuotation."DocNum",
	CASE 
		WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY(SalesQuotation."DocCur") = 1 THEN SalesQuotation."DocTotal"
		ELSE SalesQuotation."DocTotalFC"
	END AS "DocTotal",
	COALESCE(SalesPerson."SlpName",'---') AS "SalesPerson",
	CASE
		WHEN SalesQuotationRows."UomEntry" > -1 THEN  CONCAT(SalesQuotationRows."Dscription", ' - [' || SalesQuotationRows."UomCode" || ']')
		ELSE SalesQuotationRows."Dscription"
	END AS "ItemName",
	CASE 
		WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY(SalesQuotation."DocCur") = 1 THEN SalesQuotation."VatSum"
		ELSE SalesQuotation."VatSumFC"
	END AS "Tax",
	SalesQuotationRows."Quantity",
	SalesQuotationRows."DiscPrcnt" AS "DiscountPercent",
	SalesQuotationRows."VatPrcnt" AS "TaxRate",
	SalesQuotationRows."PriceBefDi" AS "UnitPrice",
	(SalesQuotationRows."PriceBefDi" - SalesQuotationRows."Price") AS "Discount",
	SalesQuotationRows."Currency" AS "Currency",
	CASE 
		WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY(SalesQuotation."DocCur") = 1 THEN SalesQuotationRows."LineTotal"
		ELSE SalesQuotationRows."TotalFrgn"
	END AS "LineTotal"
FROM "OQUT" AS SalesQuotation
INNER JOIN "QUT1" SalesQuotationRows
	ON SalesQuotation."DocEntry" = SalesQuotationRows."DocEntry"
INNER JOIN "OCRD" BusinessPartner
	ON SalesQuotation."CardCode" = BusinessPartner."CardCode"
INNER JOIN "OSLP" SalesPerson
	ON SalesQuotation."SlpCode" = SalesPerson."SlpCode" WITH READ ONLY;



--152-----------------------------------------------------------152--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_SALESMAN_B1SLQuery" ( "SlpCode", "SlpName", "SlpCodeName" ) AS SELECT
	SM."SlpCode",
	SM."SlpName",
	SM."SlpCode" || ' - ' || SM."SlpName" AS "SlpCodeName"
FROM "OSLP" SM
WHERE SM."Active" = 'Y';



--153-----------------------------------------------------------153--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_SALESORDERROWS_B1SLQuery" ( "ItemCode", "ItemDescription", "UnitPrice", "Currency", "DiscountPercent", "Quantity", "TaxCode", "TaxRate", "WarehouseCode", "WhsName", "BaseLine", "BaseEntry", "BaseType", "LineStatus", "CostingCode", "UomEntry", "LineNum", "TreeType", "InventoryItem", "ManSerNum", "ManBtchNum", "OnHand", "LastPurchasePrice", "ItemGroupCode", "ItemClass", "DistNumber", "SysNumber", "SODocEntry", "SORDocEntry", "SNDocEntry", "CardCode", "SNQuantity", "FatherCode", "TaxOnly", "HideComp", "VATLiable" ) AS SELECT
	 DISTINCT SalesOrderRows."ItemCode" AS "ItemCode",
	 SalesOrderRows."Dscription" AS "ItemDescription",
	 CAST(SalesOrderRows."PriceBefDi" AS DECIMAL(18,
	 2)) AS "UnitPrice",
	 SalesOrderRows."Currency",
	 CAST(COALESCE(SalesOrderRows."DiscPrcnt",
	 0) AS DECIMAL(18,
	 2)) AS "DiscountPercent",
	 CAST(SalesOrderRows."Quantity" AS DECIMAL(18,
	 2)) AS "Quantity",
	 SalesOrderRows."TaxCode" AS "TaxCode",
	 CAST(SalesOrderRows."VatPrcnt" AS DECIMAL(18,
	 2)) AS "TaxRate",
	 SalesOrderRows."WhsCode" AS "WarehouseCode",
	 Warehouse."WhsName" AS "WhsName",
	 SalesOrderRows."BaseLine" AS "BaseLine",
	 SalesOrderRows."BaseEntry" AS "BaseEntry",
	 SalesOrderRows."BaseType" AS "BaseType",
	 SalesOrderRows."LineStatus" AS "LineStatus",
	 SalesOrderRows."OcrCode" AS "CostingCode",
	 SalesOrderRows."UomEntry" AS "UomEntry",
	 SalesOrderRows."LineNum" AS "LineNum",
	 CASE SalesOrderRows."TreeType" WHEN 'N' 
THEN 'iNotATree' WHEN 'S' 
THEN 'iSalesTree' WHEN 'I' 
THEN 'iIngredient' 
ELSE '' 
END AS "TreeType",
	 Items."InvntItem" AS "InventoryItem",
	 Items."ManSerNum" AS "ManSerNum",
	 Items."ManBtchNum" AS "ManBtchNum",
	 CAST( CASE WHEN (ItemsWarehouse."OnHand") > 0 
	THEN CAST(ItemsWarehouse."OnHand" AS DECIMAL(18,
	 2)) 
	ELSE 0 
	END AS DECIMAL(18,
	 2)) AS "OnHand",
	 CAST(ItemsWarehouse."AvgPrice" AS DECIMAL(18,
	 2)) AS "LastPurchasePrice",
	 CAST(ItemGroups."ItmsGrpCod" AS INT) AS "ItemGroupCode",
	 ItemGroups."ItemClass" AS "ItemClass",
	 COALESCE(SerialNumbers."DistNumber",
	 '') AS "DistNumber",
	 COALESCE(SerialNumbers."SysNumber",
	 0) AS "SysNumber",
	 SalesOrder."DocEntry" AS "SODocEntry",
	 SalesOrderRows."DocEntry" AS "SORDocEntry",
	 SerialNumbers."DocEntry" AS "SNDocEntry",
	 SalesOrder."CardCode" AS "CardCode",
	 SerialNumbers."Quantity" AS "SNQuantity",
	 ITT1."Father" AS "FatherCode",
	 SalesOrderRows."TaxOnly" AS "TaxOnly",
	 OIT."HideComp" AS "HideComp",
	 (CAST(
			CASE 
				WHEN SalesOrderRows."TaxStatus" = 'Y' THEN 1
				ELSE 0
			END AS INT)
		)AS "VATLiable" 
FROM "ORDR" AS SalesOrder 
INNER JOIN "OCRD" AS BusinessPartner ON SalesOrder."CardCode" = BusinessPartner."CardCode" 
INNER JOIN "RDR1" AS SalesOrderRows ON SalesOrder."DocEntry" = SalesOrderRows."DocEntry" 
INNER JOIN "OITM" AS Items ON SalesOrderRows."ItemCode" = Items."ItemCode" 
INNER JOIN "ITM1" AS ItemsPrices ON SalesOrderRows."ItemCode" = ItemsPrices."ItemCode" 
INNER JOIN "OITW" AS ItemsWarehouse ON Items."ItemCode" = ItemsWarehouse."ItemCode" 
AND SalesOrderRows."WhsCode" = ItemsWarehouse."WhsCode" 
INNER JOIN "OWHS" AS Warehouse ON ItemsWarehouse."WhsCode" = Warehouse."WhsCode" 
AND SalesOrderRows."WhsCode" = Warehouse."WhsCode" 
INNER JOIN "OITB" AS ItemGroups ON Items."ItmsGrpCod" = ItemGroups."ItmsGrpCod" 
AND SalesOrderRows."ItemCode" = Items."ItemCode" 
LEFT JOIN "ITT1" ON ITT1."Father" = SalesOrderRows."ItemCode" 
LEFT JOIN OITT AS OIT ON OIT."Code"=Items."ItemCode" 
LEFT JOIN CLVS_D_MLT_SLT_ORDER_DETAILTRANSAC AS SerialNumbers ON SalesOrderRows."ItemCode" = SerialNumbers."ItemCode" 
AND SerialNumbers."DocLine" = SalesOrderRows."LineNum" 
AND SerialNumbers."DocEntry" = SalesOrderRows."DocEntry" WITH READ ONLY;



--154-----------------------------------------------------------154--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_SALESORDER_B1SLQuery" ( "DocEntry", "DocNum", "CardCode", "CardName", "SalesPersonCode", "SalesPersonName", "TaxDate", "DocDueDate", "DocDate", "DocDateOrder", "DocDateFilter", "DocCurrency", "PaymentGroupCode", "PriceList", "Series", "Comments", "DocStatus", "DocTotal", "CardNameDefault", "CardCodeDefault", "SlpCodeDefault", "DocNumDefault", "DocStatusDefault", "CurrencyDefault", "Email", "IdType", "Identification", "TipoDocE", "AttachmentEntry" ) AS SELECT
	 SalesOrder."DocEntry" AS "DocEntry",
	 SalesOrder."DocNum" AS "DocNum",
	 SalesOrder."CardCode" AS "CardCode",
	 SalesOrder."CardName" AS "CardName",
	 COALESCE(SalesOrder."SlpCode",
	 0) AS "SalesPersonCode",
	 COALESCE(SalesPerson."SlpName",
	 '---') AS "SalesPersonName",
	 CAST("TaxDate" AS DATE) AS "TaxDate",
	 CAST("DocDueDate" AS DATE) AS "DocDueDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime", "DocDate") AS "DocDate",
	 COALESCE(CLVS_D_MLT_SLT_DOCFULLDATE("DocTime", "DocDate"),
	 '') AS "DocDateOrder",
	 TO_DATE(COALESCE(SalesOrder."DocDate",
	 CURRENT_DATE)) AS "DocDateFilter",
	 SalesOrder."DocCur" AS "DocCurrency",
	 SalesOrder."GroupNum" AS "PaymentGroupCode",
	 COALESCE(SalesOrder."U_ListNum",
	 0) AS "PriceList",
	 SalesOrder."Series" AS "Series",
	 SalesOrder."Comments" AS "Comments",
	 SalesOrder."DocStatus" AS "DocStatus",
	 CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY(SalesOrder."DocCur") = 1 
THEN SalesOrder."DocTotal" 
ELSE SalesOrder."DocTotalFC" 
END AS "DocTotal",
	 '' AS "CardNameDefault",
	 '' AS "CardCodeDefault",
	 0 AS "SlpCodeDefault",
	 0 AS "DocNumDefault",
	 'ALL' AS "DocStatusDefault",
	 'ALL' AS "CurrencyDefault",
	 COALESCE(SalesOrder."U_CorreoFE",
	 '') AS "Email",
	 COALESCE(SalesOrder."U_TipoIdentificacion",
	 '') AS "IdType",
	 COALESCE(SalesOrder."U_NumIdentFE",
	 '') AS "Identification",
	 COALESCE(SalesOrder."U_TipoDocE",
	 '') AS "TipoDocE",
	 SalesOrder."AtcEntry" AS "AttachmentEntry" 
FROM "ORDR" SalesOrder 
LEFT JOIN "OSLP" SalesPerson ON SalesPerson."SlpCode" = SalesOrder."SlpCode" WITH READ ONLY;



--155-----------------------------------------------------------155--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_SALESQUOTATIONROWS_B1SLQuery" ( "DocEntry", "LineNum", "LineTotal", "ItemCode", "ItemDescription", "UnitPrice", "Currency", "Quantity", "DiscountPercent", "TaxCode", "TaxRate", "WarehouseCode", "WhsName", "CostingCode", "BaseType", "BaseEntry", "BaseLine", "LineStatus", "InventoryItem", "OnHand", "ItemGroupCode", "LastPurchasePrice", "LastPurchasePriceFC", "ItemClass", "UomEntry", "ManSerNum", "ManBtchNum", "TreeType", "FatherCode", "TaxOnly", "HideComp", "VATLiable" ) AS SELECT
	 DISTINCT SalesQuotationsRows."DocEntry" AS "DocEntry",
	 SalesQuotationsRows."LineNum" AS "LineNum",
	 SalesQuotationsRows."LineTotal" AS "LineTotal",
	 SalesQuotationsRows."ItemCode" AS "ItemCode",
	 SalesQuotationsRows."Dscription" AS "ItemDescription",
	 SalesQuotationsRows."PriceBefDi" AS "UnitPrice",
	 SalesQuotationsRows."Currency" AS "Currency",
	 SalesQuotationsRows."Quantity" AS "Quantity",
	 COALESCE(SalesQuotationsRows."DiscPrcnt",
	 0) AS "DiscountPercent",
	 SalesQuotationsRows."TaxCode" AS "TaxCode",
	 SalesQuotationsRows."VatPrcnt" AS "TaxRate",
	 SalesQuotationsRows."WhsCode" AS "WarehouseCode",
	 Warehouse."WhsName" AS "WhsName",
	 SalesQuotationsRows."OcrCode" AS "CostingCode",
	 SalesQuotationsRows."BaseType" AS "BaseType",
	 SalesQuotationsRows."BaseEntry" AS "BaseEntry",
	 SalesQuotationsRows."LineNum" AS "BaseLine",
	 SalesQuotationsRows."LineStatus" AS "LineStatus",
	 Item."InvntItem" AS "InventoryItem",
	 CASE WHEN IT."OnHand" > 0 
THEN CAST(IT."OnHand" AS DECIMAL(18,
	 2)) 
ELSE 0 
END AS "OnHand",
	 CAST(Item."ItmsGrpCod" AS INT) AS "ItemGroupCode",
	 CAST((SELECT
	 SIT."AvgPrice" 
		FROM "OITW" SIT 
		WHERE SIT."ItemCode" = Item."ItemCode" 
		AND SIT."WhsCode" = SalesQuotationsRows."WhsCode") AS DECIMAL(18,
	 2)) AS "LastPurchasePrice",
	 -1 AS "LastPurchasePriceFC",
	 (SELECT
	 T1."ItemClass" 
	FROM "OITB" T1 
	WHERE Item."ItmsGrpCod" = T1."ItmsGrpCod") AS "ItemClass",
	 SalesQuotationsRows."UomEntry" AS "UomEntry",
	 Item."ManSerNum" AS "ManSerNum",
	 Item."ManBtchNum" AS "ManBtchNum",
	 CASE SalesQuotationsRows."TreeType" WHEN 'N' 
THEN 'iNotATree' WHEN 'S' 
THEN 'iSalesTree' WHEN 'I' 
THEN 'iIngredient' 
ELSE '' 
END AS "TreeType",
	 COALESCE(billMat."Father",
	 '') AS "FatherCode",
	 SalesQuotationsRows."TaxOnly" AS "TaxOnly",
	 OIT."HideComp" AS "HideComp",
	 (CAST(
			CASE 
				WHEN SalesQuotationsRows."TaxStatus" = 'Y' THEN 1
				ELSE 0
			END AS INT)
		)AS "VATLiable" 
FROM "QUT1" SalesQuotationsRows 
INNER JOIN "OITM" Item ON SalesQuotationsRows."ItemCode" = Item."ItemCode" 
INNER JOIN "OITW" IT ON IT."ItemCode" = Item."ItemCode" 
AND IT."WhsCode" = SalesQuotationsRows."WhsCode" 
INNER JOIN "OWHS" Warehouse ON IT."WhsCode" = Warehouse."WhsCode" 
AND SalesQuotationsRows."WhsCode" = Warehouse."WhsCode" 
LEFT JOIN "ITT1" billMat ON SalesQuotationsRows."ItemCode" = billMat."Father" 
LEFT JOIN OITT AS OIT ON OIT."Code"=Item."ItemCode" WITH READ ONLY;



--156-----------------------------------------------------------156--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_SALESQUOTATION_B1SLQuery" ( "DocEntry", "DocNum", "CardCode", "CardName", "SalesPersonCode", "SalesPersonName", "TaxDate", "DocDueDate", "DocDate", "DocDateOrder", "DocDateFilter", "DocCurrency", "PaymentGroupCode", "PriceList", "Series", "Comments", "DocStatus", "AttachmentEntry", "DocTotal", "CardNameDefault", "CardCodeDefault", "SlpCodeDefault", "DocNumDefault", "DocStatusDefault", "CurrencyDefault", "Email", "IdType", "Identification", "TipoDocE" ) AS SELECT
	 SalesQuotation."DocEntry" AS "DocEntry",
	 SalesQuotation."DocNum" AS "DocNum",
	 SalesQuotation."CardCode" AS "CardCode",
	 SalesQuotation."CardName" AS "CardName",
	 COALESCE(SalesPerson."SlpCode",
	 0) AS "SalesPersonCode",
	 COALESCE(SalesPerson."SlpName",
	 '---') AS "SalesPersonName",
	 CAST("TaxDate" AS DATE) AS "TaxDate",
	 CAST("DocDueDate" AS DATE) AS "DocDueDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime", "DocDate") AS "DocDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime", "DocDate") AS "DocDateOrder",
	 TO_DATE(SalesQuotation."DocDate") AS "DocDateFilter",
	 SalesQuotation."DocCur" AS "DocCurrency",
	 SalesQuotation."GroupNum" AS "PaymentGroupCode",
	 COALESCE(SalesQuotation."U_ListNum",
	 0) AS "PriceList",
	 SalesQuotation."Series" AS "Series",
	 SalesQuotation."Comments" AS "Comments",
	 SalesQuotation."DocStatus" AS "DocStatus",
	 SalesQuotation."AtcEntry" AS "AttachmentEntry",
	 CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY(SalesQuotation."DocCur") = 1 
THEN SalesQuotation."DocTotal" 
ELSE SalesQuotation."DocTotalFC" 
END AS "DocTotal",
	 '' AS "CardNameDefault",
	 '' AS "CardCodeDefault",
	 0 AS "SlpCodeDefault",
	 0 AS "DocNumDefault",
	 'ALL' AS "DocStatusDefault",
	 'ALL' AS "CurrencyDefault",
	 COALESCE(SalesQuotation."U_CorreoFE",
	 '') AS "Email",
	 COALESCE(SalesQuotation."U_TipoIdentificacion",
	 '') AS "IdType",
	 COALESCE(SalesQuotation."U_NumIdentFE",
	 '') AS "Identification",
	 COALESCE(SalesQuotation."U_TipoDocE",
	 '') AS "TipoDocE" 
FROM "OQUT" SalesQuotation 
LEFT JOIN "OSLP" SalesPerson ON SalesPerson."SlpCode" = SalesQuotation."SlpCode" WITH READ ONLY;



--157-----------------------------------------------------------157--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_SALESTAXCODES_B1SLQuery" ( "TaxCode", "TaxRate", "ValidForAR", "ValidForAP" ) AS SELECT
    SalesTaxCodes."Code" AS "TaxCode",
    SalesTaxCodes."Rate" AS "TaxRate",
    SalesTaxCodes."ValidForAR",
    SalesTaxCodes."ValidForAP"
FROM "OSTC" SalesTaxCodes
WHERE SalesTaxCodes."Lock" = 'N';



--158-----------------------------------------------------------158--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_SERIAL_STOCK" ( "ItemCode", "SysNumber", "DistNumber", "WhsCode", "Quantity", "Type" ) AS SELECT
    "OSRN"."ItemCode",
    "OSRN"."SysNumber",
    "OSRN"."DistNumber",
    "OSRQ"."WhsCode",
    "OSRQ"."Quantity",
    2 AS "Type"
FROM "OSRN"
INNER JOIN "OSRQ"
    ON "OSRN"."AbsEntry" = "OSRQ"."MdAbsEntry"
    AND ("OSRQ"."Quantity" - "OSRQ"."CommitQty") > 0 WITH READ ONLY;



--159-----------------------------------------------------------159--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_STATESCOUNTRIESACTIVITY_B1SLQuery" ( "Code", "Country", "Name" ) AS ((SELECT
	'' AS "Code",
	'' AS "Country",
	'' AS "Name"
FROM "OCST") UNION (SELECT
	"Code",
	"Country",
	"Name"
FROM "OCST")) WITH READ ONLY;



--160-----------------------------------------------------------160--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_STATES_B1SLQuery" ( "Code", "Name", "Country" ) AS SELECT
    "Code" AS "Code",
    "Name" AS "Name",
    "Country" AS "Country"
FROM "OCST";



--161-----------------------------------------------------------161--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_STATUSAPPROVALDOCUMENT" ( "WtmCode", "TransType", "Status", "Approval_Status", "DraftEntry" ) AS SELECT 
	M3."WtmCode",
	M3."TransType",	
	DD."Status",
	CASE
        WHEN DD."Status" = 'Y' THEN 'Aprobado'
        WHEN DD."Status" = 'W' THEN 'Pendiente'
        WHEN DD."Status" = 'N' THEN 'Rechazado'
        WHEN DD."Status" = 'P' THEN 'Generado'
        WHEN DD."Status" = 'A' THEN 'Generado por autorizador'
        WHEN DD."Status" = 'C' THEN 'Cancelado'
        ELSE ''
    END AS "Approval_Status",
	DD."DraftEntry"
FROM 
	"WTM3" M3 
	JOIN "OWTM" TM ON TM."WtmCode" = M3."WtmCode" 
	JOIN "OWDD" DD ON DD."WtmCode" = TM."WtmCode" AND DD."ObjType" = M3."TransType"
WHERE
	TM."Active" ='Y' WITH READ ONLY;



--162-----------------------------------------------------------162--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_STOCKINWAREHOUSES_B1SLQuery" ( "OnHand", "IsCommited", "OnOrder", "WhsCode", "WhsName", "ItemCode", "BinActivat" ) AS SELECT
	 CASE WHEN (ItemWarehouses."OnHand" - ItemWarehouses."IsCommited") > 0 
THEN (ItemWarehouses."OnHand" - ItemWarehouses."IsCommited") 
ELSE 0 
END AS "OnHand",
	 ItemWarehouses."IsCommited",
	 ItemWarehouses."OnOrder",
	 Warehouses."WhsCode",
	 Warehouses."WhsName",
	 ItemWarehouses."ItemCode",
	 Warehouses."BinActivat" 
FROM "OITW" ItemWarehouses 
INNER JOIN "OWHS" Warehouses ON ItemWarehouses."WhsCode" = Warehouses."WhsCode" WITH READ ONLY;



--163-----------------------------------------------------------163--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_STOCKTRANSFERTOPRINT_B1SLQuery" ( "CardCode", "CardName", "DocCurrency", "FederalTaxID", "Phone", "DocEntry", "DocDate", "DocNum", "DocTotal", "SalesPerson", "ItemName", "Tax", "Quantity", "DiscountPercent", "TaxRate", "UnitPrice", "Discount", "Currency", "LineTotal" ) AS SELECT
	 COALESCE(StockTransfer."CardCode", '') AS "CardCode",
	 COALESCE(StockTransfer."CardName", '') AS "CardName",
	 StockTransfer."DocCur" AS "DocCurrency",
	 COALESCE(BusinessPartner."LicTradNum",
	 '---') AS "FederalTaxID",
	 COALESCE(BusinessPartner."Phone1",
	 '---') AS "Phone",
	 StockTransfer."DocEntry",
	 StockTransfer."DocDate",
	 StockTransfer."DocNum",
	 CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY(StockTransfer."DocCur") = 1 
THEN StockTransfer."DocTotal" 
ELSE StockTransfer."DocTotalFC" 
END AS "DocTotal",
	 COALESCE(SalesPerson."SlpName",
	 '---') AS "SalesPerson",
	 CASE WHEN StockTransferRows."UomEntry" > -1 
THEN CONCAT(StockTransferRows."Dscription",
	 ' - [' || StockTransferRows."UomCode" || ']') 
ELSE StockTransferRows."Dscription" 
END AS "ItemName",
	 CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY(StockTransfer."DocCur") = 1 
THEN StockTransferRows."VatSum" 
ELSE StockTransferRows."VatSumSy" 
END AS "Tax",
	 StockTransferRows."Quantity",
	 StockTransferRows."DiscPrcnt" AS "DiscountPercent",
	 StockTransferRows."VatPrcnt" AS "TaxRate",
	 StockTransferRows."PriceBefDi" AS "UnitPrice",
	 (StockTransferRows."PriceBefDi" - StockTransferRows."Price") AS "Discount",
	 StockTransferRows."Currency" AS "Currency",
	 CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY(StockTransfer."DocCur") = 1 
THEN StockTransferRows."LineTotal" 
ELSE StockTransferRows."TotalFrgn" 
END AS "LineTotal" 
FROM OWTR AS StockTransfer 
INNER JOIN WTR1 AS StockTransferRows ON StockTransfer."DocEntry" = StockTransferRows."DocEntry" 
LEFT JOIN OCRD AS BusinessPartner ON StockTransfer."CardCode" = BusinessPartner."CardCode" 
INNER JOIN OSLP AS SalesPerson ON StockTransfer."SlpCode" = SalesPerson."SlpCode" WITH READ ONLY;



--164-----------------------------------------------------------164--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_STOCK_TRANSFER_B1SLQuery" ( "DocEntry", "DocNum", "CardName", "DocDate", "DocDateOrder", "DocDateFilter", "DocStatus", "SlpCode", "SlpName", "Comments", "DocStatusDefault", "SlpCodeDefault", "DocNumDefault" ) AS SELECT
	 TransferReq."DocEntry",
	 TransferReq."DocNum",
	 TransferReq."CardName",
	 CLVS_D_MLT_SLT_DOCFULLDATE(TransferReq."DocTime", TransferReq."DocDate") AS "DocDate",
	 CLVS_D_MLT_SLT_DOCFULLDATE(TransferReq."DocTime", TransferReq."DocDate") AS "DocDateOrder",
	 CAST(TransferReq."DocDate" AS DATE) AS "DocDateFilter",
	 TransferReq."DocStatus",
	 SalesPerson."SlpCode",
	 SalesPerson."SlpName",
	 TransferReq."Comments",
	 'ALL' AS "DocStatusDefault",
	 0 AS "SlpCodeDefault",
	 0 AS "DocNumDefault" 
FROM OWTR AS TransferReq 
INNER JOIN OSLP AS SalesPerson ON TransferReq."SlpCode" = SalesPerson."SlpCode" WITH READ ONLY;



--165-----------------------------------------------------------165--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_SUBJECTACTIVITIES_B1SLQuery" ( "Code", "Name" ) AS ((SELECT
	 '-1' AS "Code",
	 '' AS "Name" 
	 FROM "OCLS") UNION (SELECT
	 "Code",
	 "Name" 
FROM "OCLS")) WITH READ ONLY;



--166-----------------------------------------------------------166--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_TAXCODEBYTAXRATE_B1SLQuery" ( "TaxCode", "Rate" ) AS SELECT T0."Code" AS "TaxCode",
	CAST(T0."Rate" AS FLOAT) AS "Rate"
FROM "OSTC" T0;



--167-----------------------------------------------------------167--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_TRANSACBATCHFORNC_B1SLQuery" ( "DocEntry", "SysNumber", "DistNumber", "ItemCode", "AllocQty", "MdAbsEntry", "AbsEntry", "DocLine" ) AS SELECT
    InventoryTransactionsLog."DocEntry" AS "DocEntry",
    BatchDetailsTransac."SysNumber" AS "SysNumber",
    BatchNumbers."DistNumber" AS "DistNumber",
    BatchNumbers."ItemCode" AS "ItemCode",
    BatchDetailsTransac."AllocQty" AS "AllocQty",
    BatchDetailsTransac."MdAbsEntry" AS "MdAbsEntry",
    BatchNumbers."AbsEntry" AS "AbsEntry",
    InventoryTransactionsLog."DocLine" AS "DocLine"
FROM "OITL" InventoryTransactionsLog
INNER JOIN "ITL1" BatchDetailsTransac
    ON InventoryTransactionsLog."LogEntry" = BatchDetailsTransac."LogEntry"
    AND InventoryTransactionsLog."DocType" = '13'
INNER JOIN "OBTN" BatchNumbers
    ON BatchDetailsTransac."MdAbsEntry" = BatchNumbers."AbsEntry" WITH READ ONLY;



--168-----------------------------------------------------------168--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_TRANSFERREQUESTTOPRINT_B1SLQuery" ( "CardCode", "CardName", "DocCurrency", "FederalTaxID", "Phone", "DocEntry", "DocDate", "DocNum", "DocTotal", "SalesPerson", "ItemName", "Tax", "Quantity", "DiscountPercent", "TaxRate", "UnitPrice", "Discount", "Currency", "LineTotal" ) AS SELECT
	 COALESCE(TransferRequest."CardCode", '') AS "CardCode",
	 COALESCE(TransferRequest."CardName", '') AS "CardName",
	 TransferRequest."DocCur" AS "DocCurrency",
	 COALESCE(BusinessPartner."LicTradNum",
	 '---') AS "FederalTaxID",
	 COALESCE(BusinessPartner."Phone1",
	 '---') AS "Phone",
	 TransferRequest."DocEntry",
	 TransferRequest."DocDate",
	 TransferRequest."DocNum",
	 CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY(TransferRequest."DocCur") = 1 
THEN TransferRequest."DocTotal" 
ELSE TransferRequest."DocTotalFC" 
END AS "DocTotal",
	 COALESCE(SalesPerson."SlpName",
	 '---') AS "SalesPerson",
	 CASE WHEN TransferRequestRows."UomEntry" > -1 
THEN CONCAT(TransferRequestRows."Dscription",
	 ' - [' || TransferRequestRows."UomCode" || ']') 
ELSE TransferRequestRows."Dscription" 
END AS "ItemName",
	 CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY(TransferRequest."DocCur") = 1 
THEN TransferRequestRows."VatSum" 
ELSE TransferRequestRows."VatSumSy" 
END AS "Tax",
	 TransferRequestRows."Quantity",
	 TransferRequestRows."DiscPrcnt" AS "DiscountPercent",
	 TransferRequestRows."VatPrcnt" AS "TaxRate",
	 TransferRequestRows."PriceBefDi" AS "UnitPrice",
	 (TransferRequestRows."PriceBefDi" - TransferRequestRows."Price") AS "Discount",
	 TransferRequestRows."Currency" AS "Currency",
	 CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY(TransferRequest."DocCur") = 1 
THEN TransferRequestRows."LineTotal" 
ELSE TransferRequestRows."TotalFrgn" 
END AS "LineTotal" 
FROM OWTQ AS TransferRequest 
INNER JOIN WTQ1 AS TransferRequestRows ON TransferRequest."DocEntry" = TransferRequestRows."DocEntry" 
LEFT JOIN OCRD AS BusinessPartner ON TransferRequest."CardCode" = BusinessPartner."CardCode" 
INNER JOIN OSLP AS SalesPerson ON TransferRequest."SlpCode" = SalesPerson."SlpCode" WITH READ ONLY;



--169-----------------------------------------------------------169--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_TRANSFERREQUEST_HEADER_B1SLQuery" ( "DocEntry", "DocNum", "DocDate", "DocStatus", "Comments", "DueDate", "TaxDate", "FromWarehouse", "ToWarehouse", "SalesPersonCode", "AttachmentEntry" ) AS SELECT
	 "TransferR"."DocEntry",
	 "TransferR"."DocNum",
	 "TransferR"."DocDate",
	 "TransferR"."DocStatus",
	 "TransferR"."Comments",
	 "TransferR"."DocDueDate" as "DueDate",
	 "TransferR"."TaxDate",
	 "TransferR"."Filler" AS "FromWarehouse",
	 "TransferR"."ToWhsCode" AS "ToWarehouse",
	 "TransferR"."SlpCode" AS "SalesPersonCode" ,
	 "TransferR"."AtcEntry" AS "AttachmentEntry"
FROM "OWTQ" AS "TransferR" WITH READ ONLY;



--170-----------------------------------------------------------170--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_TRANSFER_REQUESTS_B1SLQuery" ( "DocEntry", "DocNum", "CardName", "DocDate", "DocDateOrder", "DocDateFilter", "DocStatus", "SlpCode", "SlpName", "Comments", "DocStatusDefault", "SlpCodeDefault", "DocNumDefault" ) AS SELECT
	 "TransferReq"."DocEntry",
	 "TransferReq"."DocNum",
	 "TransferReq"."CardName",
	 CLVS_D_MLT_SLT_DOCFULLDATE("DocTime", "DocDate") AS "DocDate",
	 "TransferReq"."DocDate" AS "DocDateOrder",
	 "TransferReq"."DocDate" AS "DocDateFilter",
	 "TransferReq"."DocStatus",
	 "SalesPerson"."SlpCode",
	 "SalesPerson"."SlpName",
	 "TransferReq"."Comments",
	 'ALL' AS "DocStatusDefault",
	 0 AS "SlpCodeDefault",
	 0 AS "DocNumDefault"
FROM "OWTQ" AS "TransferReq" 
INNER JOIN "OSLP" AS "SalesPerson" ON "TransferReq"."SlpCode" = "SalesPerson"."SlpCode" WITH READ ONLY;



--171-----------------------------------------------------------171--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_TRANSFER_REQUEST_LINES_B1SLQuery" ( "DocEntry", "ItemCode", "ItemDescription", "WarehouseCode", "FromWarehouseCode", "ManSerNum", "ManBtchNum", "BinActivat", "BaseLine", "BaseEntry", "BaseType", "Quantity", "Stock", "SysNumber", "DistNumber", "BinAbs", "LineStatus" ) AS SELECT
	  Lines."DocEntry",
	 Lines."ItemCode",
	 Lines."Dscription" AS "ItemDescription",
	 Lines."WhsCode" AS "WarehouseCode",
	 Lines."FromWhsCod" AS "FromWarehouseCode",
	 Items."ManSerNum" AS "ManSerNum",
	 Items."ManBtchNum" AS "ManBtchNum",
	 Warehouses."BinActivat",
	 Lines."LineNum" AS "BaseLine",
	 Lines."DocEntry" AS "BaseEntry",
	 'InventoryTransferRequest' AS "BaseType",
	 CAST(Lines."Quantity" AS DECIMAL(18,
	 2)) AS "Quantity",
	 CAST( CASE WHEN Items."ManSerNum" = 'Y' 
	THEN 1 
	ELSE COALESCE((ItemsWarehouses."OnHand" - ItemsWarehouses."OnOrder"),
	 0) 
	END AS DECIMAL(18,
	 2)) AS "Stock",
	 COALESCE(Series."SysNumber",
	 0) AS "SysNumber",
	 COALESCE(Series."DistNumber",
	 'N/A') AS "DistNumber",
	 COALESCE(Series."BinAbs",
	 0) AS "BinAbs",
	 Lines."LineStatus" 
FROM "WTQ1" AS Lines 
INNER JOIN "OITM" AS Items ON Lines."ItemCode" = Items."ItemCode" 
INNER JOIN "OITW" AS ItemsWarehouses ON Items."ItemCode" = ItemsWarehouses."ItemCode" 
AND ItemsWarehouses."WhsCode" = Lines."FromWhsCod" 
INNER JOIN "OWHS" AS Warehouses ON ItemsWarehouses."WhsCode" = Warehouses."WhsCode" 
LEFT JOIN CLVS_D_MLT_SLT_DETAILTRANSAC AS Series ON Lines."DocEntry" = Series."DocEntry" 
AND Lines."LineNum" = Series."DocLine" WITH READ ONLY;



--172-----------------------------------------------------------172--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_UDFS_B1SLQuery" ( "TableID", "Name", "Description", "FieldType", "HeaderId", "LinesId", "Values", "DescriptionLines", "Order" ) AS SELECT
    Header."TableID",
    CONCAT('U_', Header."AliasID") AS "Name",
    Header."Descr" AS "Description",
    CASE
        WHEN Header."TypeID" = 'A' OR Header."TypeID" = 'M' THEN 'String'
        WHEN Header."TypeID" = 'B' THEN 'Double'
        WHEN Header."TypeID" = 'N' THEN 'Int32'
        WHEN Header."TypeID" = 'D' THEN 'DateTime'
        ELSE 'db_set'
    END AS "FieldType",
    Header."FieldID" AS "HeaderId",
    Lines."FieldID" AS "LinesId",
    Lines."FldValue" AS "Values",
    Lines."Descr" AS "DescriptionLines",
    CASE
        WHEN Header."TableID" = 'OCRD' AND Header."AliasID" = 'provincia' THEN 1
        WHEN Header."TableID" = 'OCRD' AND Header."AliasID" = 'canton' THEN 2
        WHEN Header."TableID" = 'OCRD' AND Header."AliasID" = 'distrito' THEN 3
        WHEN Header."TableID" = 'OCRD' AND Header."AliasID" = 'barrio' THEN 4
        WHEN Header."TableID" = 'OCRD' AND Header."AliasID" = 'direccion' THEN 5
        ELSE 6
    END AS "Order"
FROM "CUFD" AS Header
LEFT JOIN "UFD1" AS Lines
    ON Header."TableID" = Lines."TableID"
    AND Header."FieldID" = Lines."FieldID"
    AND Lines."FldValue" IS NOT NULL
GROUP BY
    Header."TableID",
    Header."AliasID",
    Header."Descr",
    Header."TypeID",
    Header."FieldID",
    Lines."FldValue",
    Lines."Descr",
    Lines."FieldID" WITH READ ONLY;



--173-----------------------------------------------------------173--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_UDF_DRF1_B1SLQuery" ( "DocEntry", "LineNum", "TargetType", "TrgetEntry", "BaseRef", "BaseType", "BaseEntry", "BaseLine", "LineStatus", "ItemCode", "Dscription", "Quantity", "ShipDate", "OpenQty", "Price", "Currency", "Rate", "DiscPrcnt", "LineTotal", "TotalFrgn", "OpenSum", "OpenSumFC", "VendorNum", "SerialNum", "WhsCode", "SlpCode", "Commission", "TreeType", "AcctCode", "TaxStatus", "GrossBuyPr", "PriceBefDi", "DocDate", "Flags", "OpenCreQty", "UseBaseUn", "SubCatNum", "BaseCard", "TotalSumSy", "OpenSumSys", "InvntSttus", "OcrCode", "Project", "CodeBars", "VatPrcnt", "VatGroup", "PriceAfVAT", "Height1", "Hght1Unit", "Height2", "Hght2Unit", "Width1", "Wdth1Unit", "Width2", "Wdth2Unit", "Length1", "Len1Unit", "length2", "Len2Unit", "Volume", "VolUnit", "Weight1", "Wght1Unit", "Weight2", "Wght2Unit", "Factor1", "Factor2", "Factor3", "Factor4", "PackQty", "UpdInvntry", "BaseDocNum", "BaseAtCard", "SWW", "VatSum", "VatSumFrgn", "VatSumSy", "FinncPriod", "ObjType", "LogInstanc", "BlockNum", "ImportLog", "DedVatSum", "DedVatSumF", "DedVatSumS", "IsAqcuistn", "DistribSum", "DstrbSumFC", "DstrbSumSC", "GrssProfit", "GrssProfSC", "GrssProfFC", "VisOrder", "INMPrice", "PoTrgNum", "PoTrgEntry", "DropShip", "PoLineNum", "Address", "TaxCode", "TaxType", "OrigItem", "BackOrdr", "FreeTxt", "PickStatus", "PickOty", "PickIdNo", "TrnsCode", "VatAppld", "VatAppldFC", "VatAppldSC", "BaseQty", "BaseOpnQty", "VatDscntPr", "WtLiable", "DeferrTax", "EquVatPer", "EquVatSum", "EquVatSumF", "EquVatSumS", "LineVat", "LineVatlF", "LineVatS", "unitMsr", "NumPerMsr", "CEECFlag", "ToStock", "ToDiff", "ExciseAmt", "TaxPerUnit", "TotInclTax", "CountryOrg", "StckDstSum", "ReleasQtty", "LineType", "TranType", "Text", "OwnerCode", "StockPrice", "ConsumeFCT", "LstByDsSum", "StckINMPr", "LstBINMPr", "StckDstFc", "StckDstSc", "LstByDsFc", "LstByDsSc", "StockSum", "StockSumFc", "StockSumSc", "StckSumApp", "StckAppFc", "StckAppSc", "ShipToCode", "ShipToDesc", "StckAppD", "StckAppDFC", "StckAppDSC", "BasePrice", "GTotal", "GTotalFC", "GTotalSC", "DistribExp", "DescOW", "DetailsOW", "GrossBase", "VatWoDpm", "VatWoDpmFc", "VatWoDpmSc", "CFOPCode", "CSTCode", "Usage", "TaxOnly", "WtCalced", "QtyToShip", "DelivrdQty", "OrderedQty", "CogsOcrCod", "CiOppLineN", "CogsAcct", "ChgAsmBoMW", "ActDelDate", "OcrCode2", "OcrCode3", "OcrCode4", "OcrCode5", "TaxDistSum", "TaxDistSFC", "TaxDistSSC", "PostTax", "Excisable", "AssblValue", "RG23APart1", "RG23APart2", "RG23CPart1", "RG23CPart2", "CogsOcrCo2", "CogsOcrCo3", "CogsOcrCo4", "CogsOcrCo5", "LnExcised", "LocCode", "StockValue", "GPTtlBasPr", "unitMsr2", "NumPerMsr2", "SpecPrice", "CSTfIPI", "CSTfPIS", "CSTfCOFINS", "ExLineNo", "isSrvCall", "PQTReqQty", "PQTReqDate", "PcDocType", "PcQuantity", "LinManClsd", "VatGrpSrc", "NoInvtryMv", "ActBaseEnt", "ActBaseLn", "ActBaseNum", "OpenRtnQty", "AgrNo", "AgrLnNum", "CredOrigin", "Surpluses", "DefBreak", "Shortages", "UomEntry", "UomEntry2", "UomCode", "UomCode2", "FromWhsCod", "NeedQty", "PartRetire", "RetireQty", "RetireAPC", "RetirAPCFC", "RetirAPCSC", "InvQty", "OpenInvQty", "EnSetCost", "RetCost", "Incoterms", "TransMod", "LineVendor", "DistribIS", "ISDistrb", "ISDistrbFC", "ISDistrbSC", "IsByPrdct", "ItemType", "PriceEdit", "PrntLnNum", "LinePoPrss", "FreeChrgBP", "TaxRelev", "LegalText", "ThirdParty", "LicTradNum", "InvQtyOnly", "UnencReasn", "ShipFromCo", "ShipFromDe", "FisrtBin", "AllocBinC", "ExpType", "ExpUUID", "ExpOpType", "DIOTNat", "MYFtype", "GPBefDisc", "ReturnRsn", "ReturnAct", "StgSeqNum", "StgEntry", "StgDesc", "ItmTaxType", "SacEntry", "NCMCode", "HsnEntry", "OriBAbsEnt", "OriBLinNum", "OriBDocTyp", "IsPrscGood", "IsCstmAct", "EncryptIV", "ExtTaxRate", "ExtTaxSum", "TaxAmtSrc", "ExtTaxSumF", "ExtTaxSumS", "StdItemId", "CommClass", "VatExEntry", "VatExLN", "NatOfTrans", "ISDtCryImp", "ISDtRgnImp", "ISOrCryExp", "ISOrRgnExp", "NVECode", "PoNum", "PoItmNum", "IndEscala", "CESTCode", "CtrSealQty", "CNJPMan", "UFFiscBene", "CUSplit", "LegalTIMD", "LegalTTCA", "LegalTW", "LegalTCD", "RevCharge", "ListNum", "U_DescriptionItemXml", "U_UDF_CodItemXML", "U_UDF_DescItemXML" ) AS SELECT "DRAFT"."DocEntry" , "DRAFT"."LineNum" , "DRAFT"."TargetType" , "DRAFT"."TrgetEntry" , "DRAFT"."BaseRef" , "DRAFT"."BaseType" , "DRAFT"."BaseEntry" , "DRAFT"."BaseLine" , "DRAFT"."LineStatus" , "DRAFT"."ItemCode" , "DRAFT"."Dscription" , "DRAFT"."Quantity" , "DRAFT"."ShipDate" , "DRAFT"."OpenQty" , "DRAFT"."Price" , "DRAFT"."Currency" , "DRAFT"."Rate" , "DRAFT"."DiscPrcnt" , "DRAFT"."LineTotal" , "DRAFT"."TotalFrgn" , "DRAFT"."OpenSum" , "DRAFT"."OpenSumFC" , "DRAFT"."VendorNum" , "DRAFT"."SerialNum" , "DRAFT"."WhsCode" , "DRAFT"."SlpCode" , "DRAFT"."Commission" , "DRAFT"."TreeType" , "DRAFT"."AcctCode" , "DRAFT"."TaxStatus" , "DRAFT"."GrossBuyPr" , "DRAFT"."PriceBefDi" , "DRAFT"."DocDate" , "DRAFT"."Flags" , "DRAFT"."OpenCreQty" , "DRAFT"."UseBaseUn" , "DRAFT"."SubCatNum" , "DRAFT"."BaseCard" , "DRAFT"."TotalSumSy" , "DRAFT"."OpenSumSys" , "DRAFT"."InvntSttus" , "DRAFT"."OcrCode" , "DRAFT"."Project" , "DRAFT"."CodeBars" , "DRAFT"."VatPrcnt" , "DRAFT"."VatGroup" , "DRAFT"."PriceAfVAT" , "DRAFT"."Height1" , "DRAFT"."Hght1Unit" , "DRAFT"."Height2" , "DRAFT"."Hght2Unit" , "DRAFT"."Width1" , "DRAFT"."Wdth1Unit" , "DRAFT"."Width2" , "DRAFT"."Wdth2Unit" , "DRAFT"."Length1" , "DRAFT"."Len1Unit" , "DRAFT"."length2" , "DRAFT"."Len2Unit" , "DRAFT"."Volume" , "DRAFT"."VolUnit" , "DRAFT"."Weight1" , "DRAFT"."Wght1Unit" , "DRAFT"."Weight2" , "DRAFT"."Wght2Unit" , "DRAFT"."Factor1" , "DRAFT"."Factor2" , "DRAFT"."Factor3" , "DRAFT"."Factor4" , "DRAFT"."PackQty" , "DRAFT"."UpdInvntry" , "DRAFT"."BaseDocNum" , "DRAFT"."BaseAtCard" , "DRAFT"."SWW" , "DRAFT"."VatSum" , "DRAFT"."VatSumFrgn" , "DRAFT"."VatSumSy" , "DRAFT"."FinncPriod" , "DRAFT"."ObjType" , "DRAFT"."LogInstanc" , "DRAFT"."BlockNum" , "DRAFT"."ImportLog" , "DRAFT"."DedVatSum" , "DRAFT"."DedVatSumF" , "DRAFT"."DedVatSumS" , "DRAFT"."IsAqcuistn" , "DRAFT"."DistribSum" , "DRAFT"."DstrbSumFC" , "DRAFT"."DstrbSumSC" , "DRAFT"."GrssProfit" , "DRAFT"."GrssProfSC" , "DRAFT"."GrssProfFC" , "DRAFT"."VisOrder" , "DRAFT"."INMPrice" , "DRAFT"."PoTrgNum" , "DRAFT"."PoTrgEntry" , "DRAFT"."DropShip" , "DRAFT"."PoLineNum" , "DRAFT"."Address" , "DRAFT"."TaxCode" , "DRAFT"."TaxType" , "DRAFT"."OrigItem" , "DRAFT"."BackOrdr" , "DRAFT"."FreeTxt" , "DRAFT"."PickStatus" , "DRAFT"."PickOty" , "DRAFT"."PickIdNo" , "DRAFT"."TrnsCode" , "DRAFT"."VatAppld" , "DRAFT"."VatAppldFC" , "DRAFT"."VatAppldSC" , "DRAFT"."BaseQty" , "DRAFT"."BaseOpnQty" , "DRAFT"."VatDscntPr" , "DRAFT"."WtLiable" , "DRAFT"."DeferrTax" , "DRAFT"."EquVatPer" , "DRAFT"."EquVatSum" , "DRAFT"."EquVatSumF" , "DRAFT"."EquVatSumS" , "DRAFT"."LineVat" , "DRAFT"."LineVatlF" , "DRAFT"."LineVatS" , "DRAFT"."unitMsr" , "DRAFT"."NumPerMsr" , "DRAFT"."CEECFlag" , "DRAFT"."ToStock" , "DRAFT"."ToDiff" , "DRAFT"."ExciseAmt" , "DRAFT"."TaxPerUnit" , "DRAFT"."TotInclTax" , "DRAFT"."CountryOrg" , "DRAFT"."StckDstSum" , "DRAFT"."ReleasQtty" , "DRAFT"."LineType" , "DRAFT"."TranType" , "DRAFT"."Text" , "DRAFT"."OwnerCode" , "DRAFT"."StockPrice" , "DRAFT"."ConsumeFCT" , "DRAFT"."LstByDsSum" , "DRAFT"."StckINMPr" , "DRAFT"."LstBINMPr" , "DRAFT"."StckDstFc" , "DRAFT"."StckDstSc" , "DRAFT"."LstByDsFc" , "DRAFT"."LstByDsSc" , "DRAFT"."StockSum" , "DRAFT"."StockSumFc" , "DRAFT"."StockSumSc" , "DRAFT"."StckSumApp" , "DRAFT"."StckAppFc" , "DRAFT"."StckAppSc" , "DRAFT"."ShipToCode" , "DRAFT"."ShipToDesc" , "DRAFT"."StckAppD" , "DRAFT"."StckAppDFC" , "DRAFT"."StckAppDSC" , "DRAFT"."BasePrice" , "DRAFT"."GTotal" , "DRAFT"."GTotalFC" , "DRAFT"."GTotalSC" , "DRAFT"."DistribExp" , "DRAFT"."DescOW" , "DRAFT"."DetailsOW" , "DRAFT"."GrossBase" , "DRAFT"."VatWoDpm" , "DRAFT"."VatWoDpmFc" , "DRAFT"."VatWoDpmSc" , "DRAFT"."CFOPCode" , "DRAFT"."CSTCode" , "DRAFT"."Usage" , "DRAFT"."TaxOnly" , "DRAFT"."WtCalced" , "DRAFT"."QtyToShip" , "DRAFT"."DelivrdQty" , "DRAFT"."OrderedQty" , "DRAFT"."CogsOcrCod" , "DRAFT"."CiOppLineN" , "DRAFT"."CogsAcct" , "DRAFT"."ChgAsmBoMW" , "DRAFT"."ActDelDate" , "DRAFT"."OcrCode2" , "DRAFT"."OcrCode3" , "DRAFT"."OcrCode4" , "DRAFT"."OcrCode5" , "DRAFT"."TaxDistSum" , "DRAFT"."TaxDistSFC" , "DRAFT"."TaxDistSSC" , "DRAFT"."PostTax" , "DRAFT"."Excisable" , "DRAFT"."AssblValue" , "DRAFT"."RG23APart1" , "DRAFT"."RG23APart2" , "DRAFT"."RG23CPart1" , "DRAFT"."RG23CPart2" , "DRAFT"."CogsOcrCo2" , "DRAFT"."CogsOcrCo3" , "DRAFT"."CogsOcrCo4" , "DRAFT"."CogsOcrCo5" , "DRAFT"."LnExcised" , "DRAFT"."LocCode" , "DRAFT"."StockValue" , "DRAFT"."GPTtlBasPr" , "DRAFT"."unitMsr2" , "DRAFT"."NumPerMsr2" , "DRAFT"."SpecPrice" , "DRAFT"."CSTfIPI" , "DRAFT"."CSTfPIS" , "DRAFT"."CSTfCOFINS" , "DRAFT"."ExLineNo" , "DRAFT"."isSrvCall" , "DRAFT"."PQTReqQty" , "DRAFT"."PQTReqDate" , "DRAFT"."PcDocType" , "DRAFT"."PcQuantity" , "DRAFT"."LinManClsd" , "DRAFT"."VatGrpSrc" , "DRAFT"."NoInvtryMv" , "DRAFT"."ActBaseEnt" , "DRAFT"."ActBaseLn" , "DRAFT"."ActBaseNum" , "DRAFT"."OpenRtnQty" , "DRAFT"."AgrNo" , "DRAFT"."AgrLnNum" , "DRAFT"."CredOrigin" , "DRAFT"."Surpluses" , "DRAFT"."DefBreak" , "DRAFT"."Shortages" , "DRAFT"."UomEntry" , "DRAFT"."UomEntry2" , "DRAFT"."UomCode" , "DRAFT"."UomCode2" , "DRAFT"."FromWhsCod" , "DRAFT"."NeedQty" , "DRAFT"."PartRetire" , "DRAFT"."RetireQty" , "DRAFT"."RetireAPC" , "DRAFT"."RetirAPCFC" , "DRAFT"."RetirAPCSC" , "DRAFT"."InvQty" , "DRAFT"."OpenInvQty" , "DRAFT"."EnSetCost" , "DRAFT"."RetCost" , "DRAFT"."Incoterms" , "DRAFT"."TransMod" , "DRAFT"."LineVendor" , "DRAFT"."DistribIS" , "DRAFT"."ISDistrb" , "DRAFT"."ISDistrbFC" , "DRAFT"."ISDistrbSC" , "DRAFT"."IsByPrdct" , "DRAFT"."ItemType" , "DRAFT"."PriceEdit" , "DRAFT"."PrntLnNum" , "DRAFT"."LinePoPrss" , "DRAFT"."FreeChrgBP" , "DRAFT"."TaxRelev" , "DRAFT"."LegalText" , "DRAFT"."ThirdParty" , "DRAFT"."LicTradNum" , "DRAFT"."InvQtyOnly" , "DRAFT"."UnencReasn" , "DRAFT"."ShipFromCo" , "DRAFT"."ShipFromDe" , "DRAFT"."FisrtBin" , "DRAFT"."AllocBinC" , "DRAFT"."ExpType" , "DRAFT"."ExpUUID" , "DRAFT"."ExpOpType" , "DRAFT"."DIOTNat" , "DRAFT"."MYFtype" , "DRAFT"."GPBefDisc" , "DRAFT"."ReturnRsn" , "DRAFT"."ReturnAct" , "DRAFT"."StgSeqNum" , "DRAFT"."StgEntry" , "DRAFT"."StgDesc" , "DRAFT"."ItmTaxType" , "DRAFT"."SacEntry" , "DRAFT"."NCMCode" , "DRAFT"."HsnEntry" , "DRAFT"."OriBAbsEnt" , "DRAFT"."OriBLinNum" , "DRAFT"."OriBDocTyp" , "DRAFT"."IsPrscGood" , "DRAFT"."IsCstmAct" , "DRAFT"."EncryptIV" , "DRAFT"."ExtTaxRate" , "DRAFT"."ExtTaxSum" , "DRAFT"."TaxAmtSrc" , "DRAFT"."ExtTaxSumF" , "DRAFT"."ExtTaxSumS" , "DRAFT"."StdItemId" , "DRAFT"."CommClass" , "DRAFT"."VatExEntry" , "DRAFT"."VatExLN" , "DRAFT"."NatOfTrans" , "DRAFT"."ISDtCryImp" , "DRAFT"."ISDtRgnImp" , "DRAFT"."ISOrCryExp" , "DRAFT"."ISOrRgnExp" , "DRAFT"."NVECode" , "DRAFT"."PoNum" , "DRAFT"."PoItmNum" , "DRAFT"."IndEscala" , "DRAFT"."CESTCode" , "DRAFT"."CtrSealQty" , "DRAFT"."CNJPMan" , "DRAFT"."UFFiscBene" , "DRAFT"."CUSplit" , "DRAFT"."LegalTIMD" , "DRAFT"."LegalTTCA" , "DRAFT"."LegalTW" , "DRAFT"."LegalTCD" , "DRAFT"."RevCharge" , "DRAFT"."ListNum" , "DRAFT"."U_DescriptionItemXml" , "DRAFT"."U_UDF_CodItemXML" , "DRAFT"."U_UDF_DescItemXML" FROM DRF1 Draft;



--174-----------------------------------------------------------174--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_UDF_INV1_B1SLQuery" ( "DocEntry", "LineNum", "TargetType", "TrgetEntry", "BaseRef", "BaseType", "BaseEntry", "BaseLine", "LineStatus", "ItemCode", "Dscription", "Quantity", "ShipDate", "OpenQty", "Price", "Currency", "Rate", "DiscPrcnt", "LineTotal", "TotalFrgn", "OpenSum", "OpenSumFC", "VendorNum", "SerialNum", "WhsCode", "SlpCode", "Commission", "TreeType", "AcctCode", "TaxStatus", "GrossBuyPr", "PriceBefDi", "DocDate", "Flags", "OpenCreQty", "UseBaseUn", "SubCatNum", "BaseCard", "TotalSumSy", "OpenSumSys", "InvntSttus", "OcrCode", "Project", "CodeBars", "VatPrcnt", "VatGroup", "PriceAfVAT", "Height1", "Hght1Unit", "Height2", "Hght2Unit", "Width1", "Wdth1Unit", "Width2", "Wdth2Unit", "Length1", "Len1Unit", "length2", "Len2Unit", "Volume", "VolUnit", "Weight1", "Wght1Unit", "Weight2", "Wght2Unit", "Factor1", "Factor2", "Factor3", "Factor4", "PackQty", "UpdInvntry", "BaseDocNum", "BaseAtCard", "SWW", "VatSum", "VatSumFrgn", "VatSumSy", "FinncPriod", "ObjType", "LogInstanc", "BlockNum", "ImportLog", "DedVatSum", "DedVatSumF", "DedVatSumS", "IsAqcuistn", "DistribSum", "DstrbSumFC", "DstrbSumSC", "GrssProfit", "GrssProfSC", "GrssProfFC", "VisOrder", "INMPrice", "PoTrgNum", "PoTrgEntry", "DropShip", "PoLineNum", "Address", "TaxCode", "TaxType", "OrigItem", "BackOrdr", "FreeTxt", "PickStatus", "PickOty", "PickIdNo", "TrnsCode", "VatAppld", "VatAppldFC", "VatAppldSC", "BaseQty", "BaseOpnQty", "VatDscntPr", "WtLiable", "DeferrTax", "EquVatPer", "EquVatSum", "EquVatSumF", "EquVatSumS", "LineVat", "LineVatlF", "LineVatS", "unitMsr", "NumPerMsr", "CEECFlag", "ToStock", "ToDiff", "ExciseAmt", "TaxPerUnit", "TotInclTax", "CountryOrg", "StckDstSum", "ReleasQtty", "LineType", "TranType", "Text", "OwnerCode", "StockPrice", "ConsumeFCT", "LstByDsSum", "StckINMPr", "LstBINMPr", "StckDstFc", "StckDstSc", "LstByDsFc", "LstByDsSc", "StockSum", "StockSumFc", "StockSumSc", "StckSumApp", "StckAppFc", "StckAppSc", "ShipToCode", "ShipToDesc", "StckAppD", "StckAppDFC", "StckAppDSC", "BasePrice", "GTotal", "GTotalFC", "GTotalSC", "DistribExp", "DescOW", "DetailsOW", "GrossBase", "VatWoDpm", "VatWoDpmFc", "VatWoDpmSc", "CFOPCode", "CSTCode", "Usage", "TaxOnly", "WtCalced", "QtyToShip", "DelivrdQty", "OrderedQty", "CogsOcrCod", "CiOppLineN", "CogsAcct", "ChgAsmBoMW", "ActDelDate", "OcrCode2", "OcrCode3", "OcrCode4", "OcrCode5", "TaxDistSum", "TaxDistSFC", "TaxDistSSC", "PostTax", "Excisable", "AssblValue", "RG23APart1", "RG23APart2", "RG23CPart1", "RG23CPart2", "CogsOcrCo2", "CogsOcrCo3", "CogsOcrCo4", "CogsOcrCo5", "LnExcised", "LocCode", "StockValue", "GPTtlBasPr", "unitMsr2", "NumPerMsr2", "SpecPrice", "CSTfIPI", "CSTfPIS", "CSTfCOFINS", "ExLineNo", "isSrvCall", "PQTReqQty", "PQTReqDate", "PcDocType", "PcQuantity", "LinManClsd", "VatGrpSrc", "NoInvtryMv", "ActBaseEnt", "ActBaseLn", "ActBaseNum", "OpenRtnQty", "AgrNo", "AgrLnNum", "CredOrigin", "Surpluses", "DefBreak", "Shortages", "UomEntry", "UomEntry2", "UomCode", "UomCode2", "FromWhsCod", "NeedQty", "PartRetire", "RetireQty", "RetireAPC", "RetirAPCFC", "RetirAPCSC", "InvQty", "OpenInvQty", "EnSetCost", "RetCost", "Incoterms", "TransMod", "LineVendor", "DistribIS", "ISDistrb", "ISDistrbFC", "ISDistrbSC", "IsByPrdct", "ItemType", "PriceEdit", "PrntLnNum", "LinePoPrss", "FreeChrgBP", "TaxRelev", "LegalText", "ThirdParty", "LicTradNum", "InvQtyOnly", "UnencReasn", "ShipFromCo", "ShipFromDe", "FisrtBin", "AllocBinC", "ExpType", "ExpUUID", "ExpOpType", "DIOTNat", "MYFtype", "GPBefDisc", "ReturnRsn", "ReturnAct", "StgSeqNum", "StgEntry", "StgDesc", "ItmTaxType", "SacEntry", "NCMCode", "HsnEntry", "OriBAbsEnt", "OriBLinNum", "OriBDocTyp", "IsPrscGood", "IsCstmAct", "EncryptIV", "ExtTaxRate", "ExtTaxSum", "TaxAmtSrc", "ExtTaxSumF", "ExtTaxSumS", "StdItemId", "CommClass", "VatExEntry", "VatExLN", "NatOfTrans", "ISDtCryImp", "ISDtRgnImp", "ISOrCryExp", "ISOrRgnExp", "NVECode", "PoNum", "PoItmNum", "IndEscala", "CESTCode", "CtrSealQty", "CNJPMan", "UFFiscBene", "CUSplit", "LegalTIMD", "LegalTTCA", "LegalTW", "LegalTCD", "RevCharge", "ListNum", "U_DescriptionItemXml", "U_UDF_CodItemXML", "U_UDF_DescItemXML" ) AS SELECT "ORD"."DocEntry" , "ORD"."LineNum" , "ORD"."TargetType" , "ORD"."TrgetEntry" , "ORD"."BaseRef" , "ORD"."BaseType" , "ORD"."BaseEntry" , "ORD"."BaseLine" , "ORD"."LineStatus" , "ORD"."ItemCode" , "ORD"."Dscription" , "ORD"."Quantity" , "ORD"."ShipDate" , "ORD"."OpenQty" , "ORD"."Price" , "ORD"."Currency" , "ORD"."Rate" , "ORD"."DiscPrcnt" , "ORD"."LineTotal" , "ORD"."TotalFrgn" , "ORD"."OpenSum" , "ORD"."OpenSumFC" , "ORD"."VendorNum" , "ORD"."SerialNum" , "ORD"."WhsCode" , "ORD"."SlpCode" , "ORD"."Commission" , "ORD"."TreeType" , "ORD"."AcctCode" , "ORD"."TaxStatus" , "ORD"."GrossBuyPr" , "ORD"."PriceBefDi" , "ORD"."DocDate" , "ORD"."Flags" , "ORD"."OpenCreQty" , "ORD"."UseBaseUn" , "ORD"."SubCatNum" , "ORD"."BaseCard" , "ORD"."TotalSumSy" , "ORD"."OpenSumSys" , "ORD"."InvntSttus" , "ORD"."OcrCode" , "ORD"."Project" , "ORD"."CodeBars" , "ORD"."VatPrcnt" , "ORD"."VatGroup" , "ORD"."PriceAfVAT" , "ORD"."Height1" , "ORD"."Hght1Unit" , "ORD"."Height2" , "ORD"."Hght2Unit" , "ORD"."Width1" , "ORD"."Wdth1Unit" , "ORD"."Width2" , "ORD"."Wdth2Unit" , "ORD"."Length1" , "ORD"."Len1Unit" , "ORD"."length2" , "ORD"."Len2Unit" , "ORD"."Volume" , "ORD"."VolUnit" , "ORD"."Weight1" , "ORD"."Wght1Unit" , "ORD"."Weight2" , "ORD"."Wght2Unit" , "ORD"."Factor1" , "ORD"."Factor2" , "ORD"."Factor3" , "ORD"."Factor4" , "ORD"."PackQty" , "ORD"."UpdInvntry" , "ORD"."BaseDocNum" , "ORD"."BaseAtCard" , "ORD"."SWW" , "ORD"."VatSum" , "ORD"."VatSumFrgn" , "ORD"."VatSumSy" , "ORD"."FinncPriod" , "ORD"."ObjType" , "ORD"."LogInstanc" , "ORD"."BlockNum" , "ORD"."ImportLog" , "ORD"."DedVatSum" , "ORD"."DedVatSumF" , "ORD"."DedVatSumS" , "ORD"."IsAqcuistn" , "ORD"."DistribSum" , "ORD"."DstrbSumFC" , "ORD"."DstrbSumSC" , "ORD"."GrssProfit" , "ORD"."GrssProfSC" , "ORD"."GrssProfFC" , "ORD"."VisOrder" , "ORD"."INMPrice" , "ORD"."PoTrgNum" , "ORD"."PoTrgEntry" , "ORD"."DropShip" , "ORD"."PoLineNum" , "ORD"."Address" , "ORD"."TaxCode" , "ORD"."TaxType" , "ORD"."OrigItem" , "ORD"."BackOrdr" , "ORD"."FreeTxt" , "ORD"."PickStatus" , "ORD"."PickOty" , "ORD"."PickIdNo" , "ORD"."TrnsCode" , "ORD"."VatAppld" , "ORD"."VatAppldFC" , "ORD"."VatAppldSC" , "ORD"."BaseQty" , "ORD"."BaseOpnQty" , "ORD"."VatDscntPr" , "ORD"."WtLiable" , "ORD"."DeferrTax" , "ORD"."EquVatPer" , "ORD"."EquVatSum" , "ORD"."EquVatSumF" , "ORD"."EquVatSumS" , "ORD"."LineVat" , "ORD"."LineVatlF" , "ORD"."LineVatS" , "ORD"."unitMsr" , "ORD"."NumPerMsr" , "ORD"."CEECFlag" , "ORD"."ToStock" , "ORD"."ToDiff" , "ORD"."ExciseAmt" , "ORD"."TaxPerUnit" , "ORD"."TotInclTax" , "ORD"."CountryOrg" , "ORD"."StckDstSum" , "ORD"."ReleasQtty" , "ORD"."LineType" , "ORD"."TranType" , "ORD"."Text" , "ORD"."OwnerCode" , "ORD"."StockPrice" , "ORD"."ConsumeFCT" , "ORD"."LstByDsSum" , "ORD"."StckINMPr" , "ORD"."LstBINMPr" , "ORD"."StckDstFc" , "ORD"."StckDstSc" , "ORD"."LstByDsFc" , "ORD"."LstByDsSc" , "ORD"."StockSum" , "ORD"."StockSumFc" , "ORD"."StockSumSc" , "ORD"."StckSumApp" , "ORD"."StckAppFc" , "ORD"."StckAppSc" , "ORD"."ShipToCode" , "ORD"."ShipToDesc" , "ORD"."StckAppD" , "ORD"."StckAppDFC" , "ORD"."StckAppDSC" , "ORD"."BasePrice" , "ORD"."GTotal" , "ORD"."GTotalFC" , "ORD"."GTotalSC" , "ORD"."DistribExp" , "ORD"."DescOW" , "ORD"."DetailsOW" , "ORD"."GrossBase" , "ORD"."VatWoDpm" , "ORD"."VatWoDpmFc" , "ORD"."VatWoDpmSc" , "ORD"."CFOPCode" , "ORD"."CSTCode" , "ORD"."Usage" , "ORD"."TaxOnly" , "ORD"."WtCalced" , "ORD"."QtyToShip" , "ORD"."DelivrdQty" , "ORD"."OrderedQty" , "ORD"."CogsOcrCod" , "ORD"."CiOppLineN" , "ORD"."CogsAcct" , "ORD"."ChgAsmBoMW" , "ORD"."ActDelDate" , "ORD"."OcrCode2" , "ORD"."OcrCode3" , "ORD"."OcrCode4" , "ORD"."OcrCode5" , "ORD"."TaxDistSum" , "ORD"."TaxDistSFC" , "ORD"."TaxDistSSC" , "ORD"."PostTax" , "ORD"."Excisable" , "ORD"."AssblValue" , "ORD"."RG23APart1" , "ORD"."RG23APart2" , "ORD"."RG23CPart1" , "ORD"."RG23CPart2" , "ORD"."CogsOcrCo2" , "ORD"."CogsOcrCo3" , "ORD"."CogsOcrCo4" , "ORD"."CogsOcrCo5" , "ORD"."LnExcised" , "ORD"."LocCode" , "ORD"."StockValue" , "ORD"."GPTtlBasPr" , "ORD"."unitMsr2" , "ORD"."NumPerMsr2" , "ORD"."SpecPrice" , "ORD"."CSTfIPI" , "ORD"."CSTfPIS" , "ORD"."CSTfCOFINS" , "ORD"."ExLineNo" , "ORD"."isSrvCall" , "ORD"."PQTReqQty" , "ORD"."PQTReqDate" , "ORD"."PcDocType" , "ORD"."PcQuantity" , "ORD"."LinManClsd" , "ORD"."VatGrpSrc" , "ORD"."NoInvtryMv" , "ORD"."ActBaseEnt" , "ORD"."ActBaseLn" , "ORD"."ActBaseNum" , "ORD"."OpenRtnQty" , "ORD"."AgrNo" , "ORD"."AgrLnNum" , "ORD"."CredOrigin" , "ORD"."Surpluses" , "ORD"."DefBreak" , "ORD"."Shortages" , "ORD"."UomEntry" , "ORD"."UomEntry2" , "ORD"."UomCode" , "ORD"."UomCode2" , "ORD"."FromWhsCod" , "ORD"."NeedQty" , "ORD"."PartRetire" , "ORD"."RetireQty" , "ORD"."RetireAPC" , "ORD"."RetirAPCFC" , "ORD"."RetirAPCSC" , "ORD"."InvQty" , "ORD"."OpenInvQty" , "ORD"."EnSetCost" , "ORD"."RetCost" , "ORD"."Incoterms" , "ORD"."TransMod" , "ORD"."LineVendor" , "ORD"."DistribIS" , "ORD"."ISDistrb" , "ORD"."ISDistrbFC" , "ORD"."ISDistrbSC" , "ORD"."IsByPrdct" , "ORD"."ItemType" , "ORD"."PriceEdit" , "ORD"."PrntLnNum" , "ORD"."LinePoPrss" , "ORD"."FreeChrgBP" , "ORD"."TaxRelev" , "ORD"."LegalText" , "ORD"."ThirdParty" , "ORD"."LicTradNum" , "ORD"."InvQtyOnly" , "ORD"."UnencReasn" , "ORD"."ShipFromCo" , "ORD"."ShipFromDe" , "ORD"."FisrtBin" , "ORD"."AllocBinC" , "ORD"."ExpType" , "ORD"."ExpUUID" , "ORD"."ExpOpType" , "ORD"."DIOTNat" , "ORD"."MYFtype" , "ORD"."GPBefDisc" , "ORD"."ReturnRsn" , "ORD"."ReturnAct" , "ORD"."StgSeqNum" , "ORD"."StgEntry" , "ORD"."StgDesc" , "ORD"."ItmTaxType" , "ORD"."SacEntry" , "ORD"."NCMCode" , "ORD"."HsnEntry" , "ORD"."OriBAbsEnt" , "ORD"."OriBLinNum" , "ORD"."OriBDocTyp" , "ORD"."IsPrscGood" , "ORD"."IsCstmAct" , "ORD"."EncryptIV" , "ORD"."ExtTaxRate" , "ORD"."ExtTaxSum" , "ORD"."TaxAmtSrc" , "ORD"."ExtTaxSumF" , "ORD"."ExtTaxSumS" , "ORD"."StdItemId" , "ORD"."CommClass" , "ORD"."VatExEntry" , "ORD"."VatExLN" , "ORD"."NatOfTrans" , "ORD"."ISDtCryImp" , "ORD"."ISDtRgnImp" , "ORD"."ISOrCryExp" , "ORD"."ISOrRgnExp" , "ORD"."NVECode" , "ORD"."PoNum" , "ORD"."PoItmNum" , "ORD"."IndEscala" , "ORD"."CESTCode" , "ORD"."CtrSealQty" , "ORD"."CNJPMan" , "ORD"."UFFiscBene" , "ORD"."CUSplit" , "ORD"."LegalTIMD" , "ORD"."LegalTTCA" , "ORD"."LegalTW" , "ORD"."LegalTCD" , "ORD"."RevCharge" , "ORD"."ListNum" , "ORD"."U_DescriptionItemXml" , "ORD"."U_UDF_CodItemXML" , "ORD"."U_UDF_DescItemXML" FROM INV1 Ord;



--175-----------------------------------------------------------175--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_UDF_OCRD_B1SLQuery" ( "CardCode", "CardName", "CardType", "GroupCode", "CmpPrivate", "Address", "ZipCode", "MailAddres", "MailZipCod", "Phone1", "Phone2", "Fax", "CntctPrsn", "Notes", "Balance", "ChecksBal", "DNotesBal", "OrdersBal", "GroupNum", "CreditLine", "DebtLine", "Discount", "VatStatus", "LicTradNum", "DdctStatus", "DdctPrcnt", "ValidUntil", "Chrctrstcs", "ExMatchNum", "InMatchNum", "ListNum", "DNoteBalFC", "OrderBalFC", "DNoteBalSy", "OrderBalSy", "Transfered", "BalTrnsfrd", "IntrstRate", "Commission", "CommGrCode", "Free_Text", "SlpCode", "PrevYearAc", "Currency", "RateDifAct", "BalanceSys", "BalanceFC", "Protected", "Cellular", "AvrageLate", "City", "County", "Country", "MailCity", "MailCounty", "MailCountr", "E_Mail", "Picture", "DflAccount", "DflBranch", "BankCode", "AddID", "Pager", "FatherCard", "CardFName", "FatherType", "QryGroup1", "QryGroup2", "QryGroup3", "QryGroup4", "QryGroup5", "QryGroup6", "QryGroup7", "QryGroup8", "QryGroup9", "QryGroup10", "QryGroup11", "QryGroup12", "QryGroup13", "QryGroup14", "QryGroup15", "QryGroup16", "QryGroup17", "QryGroup18", "QryGroup19", "QryGroup20", "QryGroup21", "QryGroup22", "QryGroup23", "QryGroup24", "QryGroup25", "QryGroup26", "QryGroup27", "QryGroup28", "QryGroup29", "QryGroup30", "QryGroup31", "QryGroup32", "QryGroup33", "QryGroup34", "QryGroup35", "QryGroup36", "QryGroup37", "QryGroup38", "QryGroup39", "QryGroup40", "QryGroup41", "QryGroup42", "QryGroup43", "QryGroup44", "QryGroup45", "QryGroup46", "QryGroup47", "QryGroup48", "QryGroup49", "QryGroup50", "QryGroup51", "QryGroup52", "QryGroup53", "QryGroup54", "QryGroup55", "QryGroup56", "QryGroup57", "QryGroup58", "QryGroup59", "QryGroup60", "QryGroup61", "QryGroup62", "QryGroup63", "QryGroup64", "DdctOffice", "CreateDate", "UpdateDate", "ExportCode", "DscntObjct", "DscntRel", "SPGCounter", "SPPCounter", "DdctFileNo", "SCNCounter", "MinIntrst", "DataSource", "OprCount", "ExemptNo", "Priority", "CreditCard", "CrCardNum", "CardValid", "UserSign", "LocMth", "validFor", "validFrom", "validTo", "frozenFor", "frozenFrom", "frozenTo", "sEmployed", "MTHCounter", "BNKCounter", "DdgKey", "DdtKey", "ValidComm", "FrozenComm", "chainStore", "DiscInRet", "State1", "State2", "VatGroup", "LogInstanc", "ObjType", "Indicator", "ShipType", "DebPayAcct", "ShipToDef", "Block", "MailBlock", "Password", "ECVatGroup", "Deleted", "IBAN", "DocEntry", "FormCode", "Box1099", "PymCode", "BackOrder", "PartDelivr", "DunnLevel", "DunnDate", "BlockDunn", "BankCountr", "CollecAuth", "DME", "InstrucKey", "SinglePaym", "ISRBillId", "PaymBlock", "RefDetails", "HouseBank", "OwnerIdNum", "PyBlckDesc", "HousBnkCry", "HousBnkAct", "HousBnkBrn", "ProjectCod", "SysMatchNo", "VatIdUnCmp", "AgentCode", "TolrncDays", "SelfInvoic", "DeferrTax", "LetterNum", "MaxAmount", "FromDate", "ToDate", "WTLiable", "CrtfcateNO", "ExpireDate", "NINum", "AccCritria", "WTCode", "Equ", "HldCode", "ConnBP", "MltMthNum", "TypWTReprt", "VATRegNum", "RepName", "Industry", "Business", "WTTaxCat", "IsDomestic", "IsResident", "AutoCalBCG", "OtrCtlAcct", "AliasName", "Building", "MailBuildi", "BoEPrsnt", "BoEDiscnt", "BoEOnClct", "UnpaidBoE", "ITWTCode", "DunTerm", "ChannlBP", "DfTcnician", "Territory", "BillToDef", "DpmClear", "IntrntSite", "LangCode", "HousActKey", "Profession", "CDPNum", "DflBankKey", "BCACode", "UseShpdGd", "RegNum", "VerifNum", "BankCtlKey", "HousCtlKey", "AddrType", "InsurOp347", "MailAddrTy", "StreetNo", "MailStrNo", "TaxRndRule", "VendTID", "ThreshOver", "SurOver", "VendorOcup", "OpCode347", "DpmIntAct", "ResidenNum", "UserSign2", "PlngGroup", "VatIDNum", "Affiliate", "MivzExpSts", "HierchDdct", "CertWHT", "CertBKeep", "WHShaamGrp", "IndustryC", "DatevAcct", "DatevFirst", "GTSRegNum", "GTSBankAct", "GTSBilAddr", "HsBnkSwift", "HsBnkIBAN", "DflSwift", "AutoPost", "IntrAcc", "FeeAcc", "CpnNo", "NTSWebSite", "DflIBAN", "Series", "Number", "EDocExpFrm", "TaxIdIdent", "Attachment", "AtcEntry", "DiscRel", "NoDiscount", "SCAdjust", "DflAgrmnt", "GlblLocNum", "SenderID", "RcpntID", "MainUsage", "SefazCheck", "ChecksBalL", "ChecksBalS", "DateFrom", "DateTill", "RelCode", "OKATO", "OKTMO", "KBKCode", "TypeOfOp", "OwnerCode", "MandateID", "SignDate", "Remark1", "ConCerti", "TpCusPres", "RoleTypCod", "BlockComm", "EmplymntCt", "ExcptnlEvt", "ExpnPrfFnd", "EdrsFromBP", "EdrsToBP", "CreateTS", "UpdateTS", "EDocGenTyp", "eStreet", "eStreetNum", "eBuildnNum", "eZipCode", "eCityTown", "eCountry", "eDistrict", "RepFName", "RepSName", "RepCmpName", "RepFisCode", "RepAddID", "PECAddr", "IPACodePA", "PriceMode", "EffecPrice", "TxExMxVdTp", "MerchantID", "UseBilAddr", "NaturalPer", "DPPStatus", "EnAddID", "EncryptIV", "EnDflAccnt", "EnDflIBAN", "EnERD4In", "EnERD4Out", "DflCustomr", "TspEntry", "TspLine", "FCERelevnt", "FCEVldte", "AggregDoc", "EffcAllSrc", "EBVatExCau", "DataVers", "LegalText", "VatResDate", "VatResCode", "EnIBAN", "DefaultCur", "VatResName", "VatResAddr", "CertDetail", "EORINumber", "FCEPmnMean", "DefCommDDt", "DefCommMon", "DefCommDay", "ExLettDate", "NotRel4MI", "U_DefCur", "U_EMA_Device", "U_Lat", "U_Lng", "U_MaxDiscBP", "U_NVT_InscMAG", "U_SubTipo", "U_MagVencimiento", "U_TipoIdentificacion", "U_provincia", "U_canton", "U_distrito", "U_barrio", "U_direccion" ) AS SELECT "ORD"."CardCode" , "ORD"."CardName" , "ORD"."CardType" , "ORD"."GroupCode" , "ORD"."CmpPrivate" , "ORD"."Address" , "ORD"."ZipCode" , "ORD"."MailAddres" , "ORD"."MailZipCod" , "ORD"."Phone1" , "ORD"."Phone2" , "ORD"."Fax" , "ORD"."CntctPrsn" , "ORD"."Notes" , "ORD"."Balance" , "ORD"."ChecksBal" , "ORD"."DNotesBal" , "ORD"."OrdersBal" , "ORD"."GroupNum" , "ORD"."CreditLine" , "ORD"."DebtLine" , "ORD"."Discount" , "ORD"."VatStatus" , "ORD"."LicTradNum" , "ORD"."DdctStatus" , "ORD"."DdctPrcnt" , "ORD"."ValidUntil" , "ORD"."Chrctrstcs" , "ORD"."ExMatchNum" , "ORD"."InMatchNum" , "ORD"."ListNum" , "ORD"."DNoteBalFC" , "ORD"."OrderBalFC" , "ORD"."DNoteBalSy" , "ORD"."OrderBalSy" , "ORD"."Transfered" , "ORD"."BalTrnsfrd" , "ORD"."IntrstRate" , "ORD"."Commission" , "ORD"."CommGrCode" , "ORD"."Free_Text" , "ORD"."SlpCode" , "ORD"."PrevYearAc" , "ORD"."Currency" , "ORD"."RateDifAct" , "ORD"."BalanceSys" , "ORD"."BalanceFC" , "ORD"."Protected" , "ORD"."Cellular" , "ORD"."AvrageLate" , "ORD"."City" , "ORD"."County" , "ORD"."Country" , "ORD"."MailCity" , "ORD"."MailCounty" , "ORD"."MailCountr" , "ORD"."E_Mail" , "ORD"."Picture" , "ORD"."DflAccount" , "ORD"."DflBranch" , "ORD"."BankCode" , "ORD"."AddID" , "ORD"."Pager" , "ORD"."FatherCard" , "ORD"."CardFName" , "ORD"."FatherType" , "ORD"."QryGroup1" , "ORD"."QryGroup2" , "ORD"."QryGroup3" , "ORD"."QryGroup4" , "ORD"."QryGroup5" , "ORD"."QryGroup6" , "ORD"."QryGroup7" , "ORD"."QryGroup8" , "ORD"."QryGroup9" , "ORD"."QryGroup10" , "ORD"."QryGroup11" , "ORD"."QryGroup12" , "ORD"."QryGroup13" , "ORD"."QryGroup14" , "ORD"."QryGroup15" , "ORD"."QryGroup16" , "ORD"."QryGroup17" , "ORD"."QryGroup18" , "ORD"."QryGroup19" , "ORD"."QryGroup20" , "ORD"."QryGroup21" , "ORD"."QryGroup22" , "ORD"."QryGroup23" , "ORD"."QryGroup24" , "ORD"."QryGroup25" , "ORD"."QryGroup26" , "ORD"."QryGroup27" , "ORD"."QryGroup28" , "ORD"."QryGroup29" , "ORD"."QryGroup30" , "ORD"."QryGroup31" , "ORD"."QryGroup32" , "ORD"."QryGroup33" , "ORD"."QryGroup34" , "ORD"."QryGroup35" , "ORD"."QryGroup36" , "ORD"."QryGroup37" , "ORD"."QryGroup38" , "ORD"."QryGroup39" , "ORD"."QryGroup40" , "ORD"."QryGroup41" , "ORD"."QryGroup42" , "ORD"."QryGroup43" , "ORD"."QryGroup44" , "ORD"."QryGroup45" , "ORD"."QryGroup46" , "ORD"."QryGroup47" , "ORD"."QryGroup48" , "ORD"."QryGroup49" , "ORD"."QryGroup50" , "ORD"."QryGroup51" , "ORD"."QryGroup52" , "ORD"."QryGroup53" , "ORD"."QryGroup54" , "ORD"."QryGroup55" , "ORD"."QryGroup56" , "ORD"."QryGroup57" , "ORD"."QryGroup58" , "ORD"."QryGroup59" , "ORD"."QryGroup60" , "ORD"."QryGroup61" , "ORD"."QryGroup62" , "ORD"."QryGroup63" , "ORD"."QryGroup64" , "ORD"."DdctOffice" , "ORD"."CreateDate" , "ORD"."UpdateDate" , "ORD"."ExportCode" , "ORD"."DscntObjct" , "ORD"."DscntRel" , "ORD"."SPGCounter" , "ORD"."SPPCounter" , "ORD"."DdctFileNo" , "ORD"."SCNCounter" , "ORD"."MinIntrst" , "ORD"."DataSource" , "ORD"."OprCount" , "ORD"."ExemptNo" , "ORD"."Priority" , "ORD"."CreditCard" , "ORD"."CrCardNum" , "ORD"."CardValid" , "ORD"."UserSign" , "ORD"."LocMth" , "ORD"."validFor" , "ORD"."validFrom" , "ORD"."validTo" , "ORD"."frozenFor" , "ORD"."frozenFrom" , "ORD"."frozenTo" , "ORD"."sEmployed" , "ORD"."MTHCounter" , "ORD"."BNKCounter" , "ORD"."DdgKey" , "ORD"."DdtKey" , "ORD"."ValidComm" , "ORD"."FrozenComm" , "ORD"."chainStore" , "ORD"."DiscInRet" , "ORD"."State1" , "ORD"."State2" , "ORD"."VatGroup" , "ORD"."LogInstanc" , "ORD"."ObjType" , "ORD"."Indicator" , "ORD"."ShipType" , "ORD"."DebPayAcct" , "ORD"."ShipToDef" , "ORD"."Block" , "ORD"."MailBlock" , "ORD"."Password" , "ORD"."ECVatGroup" , "ORD"."Deleted" , "ORD"."IBAN" , "ORD"."DocEntry" , "ORD"."FormCode" , "ORD"."Box1099" , "ORD"."PymCode" , "ORD"."BackOrder" , "ORD"."PartDelivr" , "ORD"."DunnLevel" , "ORD"."DunnDate" , "ORD"."BlockDunn" , "ORD"."BankCountr" , "ORD"."CollecAuth" , "ORD"."DME" , "ORD"."InstrucKey" , "ORD"."SinglePaym" , "ORD"."ISRBillId" , "ORD"."PaymBlock" , "ORD"."RefDetails" , "ORD"."HouseBank" , "ORD"."OwnerIdNum" , "ORD"."PyBlckDesc" , "ORD"."HousBnkCry" , "ORD"."HousBnkAct" , "ORD"."HousBnkBrn" , "ORD"."ProjectCod" , "ORD"."SysMatchNo" , "ORD"."VatIdUnCmp" , "ORD"."AgentCode" , "ORD"."TolrncDays" , "ORD"."SelfInvoic" , "ORD"."DeferrTax" , "ORD"."LetterNum" , "ORD"."MaxAmount" , "ORD"."FromDate" , "ORD"."ToDate" , "ORD"."WTLiable" , "ORD"."CrtfcateNO" , "ORD"."ExpireDate" , "ORD"."NINum" , "ORD"."AccCritria" , "ORD"."WTCode" , "ORD"."Equ" , "ORD"."HldCode" , "ORD"."ConnBP" , "ORD"."MltMthNum" , "ORD"."TypWTReprt" , "ORD"."VATRegNum" , "ORD"."RepName" , "ORD"."Industry" , "ORD"."Business" , "ORD"."WTTaxCat" , "ORD"."IsDomestic" , "ORD"."IsResident" , "ORD"."AutoCalBCG" , "ORD"."OtrCtlAcct" , "ORD"."AliasName" , "ORD"."Building" , "ORD"."MailBuildi" , "ORD"."BoEPrsnt" , "ORD"."BoEDiscnt" , "ORD"."BoEOnClct" , "ORD"."UnpaidBoE" , "ORD"."ITWTCode" , "ORD"."DunTerm" , "ORD"."ChannlBP" , "ORD"."DfTcnician" , "ORD"."Territory" , "ORD"."BillToDef" , "ORD"."DpmClear" , "ORD"."IntrntSite" , "ORD"."LangCode" , "ORD"."HousActKey" , "ORD"."Profession" , "ORD"."CDPNum" , "ORD"."DflBankKey" , "ORD"."BCACode" , "ORD"."UseShpdGd" , "ORD"."RegNum" , "ORD"."VerifNum" , "ORD"."BankCtlKey" , "ORD"."HousCtlKey" , "ORD"."AddrType" , "ORD"."InsurOp347" , "ORD"."MailAddrTy" , "ORD"."StreetNo" , "ORD"."MailStrNo" , "ORD"."TaxRndRule" , "ORD"."VendTID" , "ORD"."ThreshOver" , "ORD"."SurOver" , "ORD"."VendorOcup" , "ORD"."OpCode347" , "ORD"."DpmIntAct" , "ORD"."ResidenNum" , "ORD"."UserSign2" , "ORD"."PlngGroup" , "ORD"."VatIDNum" , "ORD"."Affiliate" , "ORD"."MivzExpSts" , "ORD"."HierchDdct" , "ORD"."CertWHT" , "ORD"."CertBKeep" , "ORD"."WHShaamGrp" , "ORD"."IndustryC" , "ORD"."DatevAcct" , "ORD"."DatevFirst" , "ORD"."GTSRegNum" , "ORD"."GTSBankAct" , "ORD"."GTSBilAddr" , "ORD"."HsBnkSwift" , "ORD"."HsBnkIBAN" , "ORD"."DflSwift" , "ORD"."AutoPost" , "ORD"."IntrAcc" , "ORD"."FeeAcc" , "ORD"."CpnNo" , "ORD"."NTSWebSite" , "ORD"."DflIBAN" , "ORD"."Series" , "ORD"."Number" , "ORD"."EDocExpFrm" , "ORD"."TaxIdIdent" , "ORD"."Attachment" , "ORD"."AtcEntry" , "ORD"."DiscRel" , "ORD"."NoDiscount" , "ORD"."SCAdjust" , "ORD"."DflAgrmnt" , "ORD"."GlblLocNum" , "ORD"."SenderID" , "ORD"."RcpntID" , "ORD"."MainUsage" , "ORD"."SefazCheck" , "ORD"."ChecksBalL" , "ORD"."ChecksBalS" , "ORD"."DateFrom" , "ORD"."DateTill" , "ORD"."RelCode" , "ORD"."OKATO" , "ORD"."OKTMO" , "ORD"."KBKCode" , "ORD"."TypeOfOp" , "ORD"."OwnerCode" , "ORD"."MandateID" , "ORD"."SignDate" , "ORD"."Remark1" , "ORD"."ConCerti" , "ORD"."TpCusPres" , "ORD"."RoleTypCod" , "ORD"."BlockComm" , "ORD"."EmplymntCt" , "ORD"."ExcptnlEvt" , "ORD"."ExpnPrfFnd" , "ORD"."EdrsFromBP" , "ORD"."EdrsToBP" , "ORD"."CreateTS" , "ORD"."UpdateTS" , "ORD"."EDocGenTyp" , "ORD"."eStreet" , "ORD"."eStreetNum" , "ORD"."eBuildnNum" , "ORD"."eZipCode" , "ORD"."eCityTown" , "ORD"."eCountry" , "ORD"."eDistrict" , "ORD"."RepFName" , "ORD"."RepSName" , "ORD"."RepCmpName" , "ORD"."RepFisCode" , "ORD"."RepAddID" , "ORD"."PECAddr" , "ORD"."IPACodePA" , "ORD"."PriceMode" , "ORD"."EffecPrice" , "ORD"."TxExMxVdTp" , "ORD"."MerchantID" , "ORD"."UseBilAddr" , "ORD"."NaturalPer" , "ORD"."DPPStatus" , "ORD"."EnAddID" , "ORD"."EncryptIV" , "ORD"."EnDflAccnt" , "ORD"."EnDflIBAN" , "ORD"."EnERD4In" , "ORD"."EnERD4Out" , "ORD"."DflCustomr" , "ORD"."TspEntry" , "ORD"."TspLine" , "ORD"."FCERelevnt" , "ORD"."FCEVldte" , "ORD"."AggregDoc" , "ORD"."EffcAllSrc" , "ORD"."EBVatExCau" , "ORD"."DataVers" , "ORD"."LegalText" , "ORD"."VatResDate" , "ORD"."VatResCode" , "ORD"."EnIBAN" , "ORD"."DefaultCur" , "ORD"."VatResName" , "ORD"."VatResAddr" , "ORD"."CertDetail" , "ORD"."EORINumber" , "ORD"."FCEPmnMean" , "ORD"."DefCommDDt" , "ORD"."DefCommMon" , "ORD"."DefCommDay" , "ORD"."ExLettDate" , "ORD"."NotRel4MI" , "ORD"."U_DefCur" , "ORD"."U_EMA_Device" , "ORD"."U_Lat" , "ORD"."U_Lng" , "ORD"."U_MaxDiscBP" , "ORD"."U_NVT_InscMAG" , "ORD"."U_SubTipo" , "ORD"."U_MagVencimiento" , "ORD"."U_TipoIdentificacion" , "ORD"."U_provincia" , "ORD"."U_canton" , "ORD"."U_distrito" , "ORD"."U_barrio" , "ORD"."U_direccion" FROM OCRD Ord;



--176-----------------------------------------------------------176--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_UDF_ODRF_B1SLQuery" ( "DocEntry", "DocNum", "DocType", "CANCELED", "Handwrtten", "Printed", "DocStatus", "InvntSttus", "Transfered", "ObjType", "DocDate", "DocDueDate", "CardCode", "CardName", "Address", "NumAtCard", "VatPercent", "VatSum", "VatSumFC", "DiscPrcnt", "DiscSum", "DiscSumFC", "DocCur", "DocRate", "DocTotal", "DocTotalFC", "PaidToDate", "PaidFC", "GrosProfit", "GrosProfFC", "Ref1", "Ref2", "Comments", "JrnlMemo", "TransId", "ReceiptNum", "GroupNum", "DocTime", "SlpCode", "TrnspCode", "PartSupply", "Confirmed", "GrossBase", "ImportEnt", "CreateTran", "SummryType", "UpdInvnt", "UpdCardBal", "Instance", "Flags", "InvntDirec", "CntctCode", "ShowSCN", "FatherCard", "SysRate", "CurSource", "VatSumSy", "DiscSumSy", "DocTotalSy", "PaidSys", "FatherType", "GrosProfSy", "UpdateDate", "IsICT", "CreateDate", "Volume", "VolUnit", "Weight", "WeightUnit", "Series", "TaxDate", "Filler", "DataSource", "StampNum", "isCrin", "FinncPriod", "UserSign", "selfInv", "VatPaid", "VatPaidFC", "VatPaidSys", "UserSign2", "WddStatus", "draftKey", "TotalExpns", "TotalExpFC", "TotalExpSC", "DunnLevel", "Address2", "LogInstanc", "Exported", "StationID", "Indicator", "NetProc", "AqcsTax", "AqcsTaxFC", "AqcsTaxSC", "CashDiscPr", "CashDiscnt", "CashDiscFC", "CashDiscSC", "ShipToCode", "LicTradNum", "PaymentRef", "WTSum", "WTSumFC", "WTSumSC", "RoundDif", "RoundDifFC", "RoundDifSy", "CheckDigit", "Form1099", "Box1099", "submitted", "PoPrss", "Rounding", "RevisionPo", "Segment", "ReqDate", "CancelDate", "PickStatus", "Pick", "BlockDunn", "PeyMethod", "PayBlock", "PayBlckRef", "MaxDscn", "Reserve", "Max1099", "CntrlBnk", "PickRmrk", "ISRCodLine", "ExpAppl", "ExpApplFC", "ExpApplSC", "Project", "DeferrTax", "LetterNum", "FromDate", "ToDate", "WTApplied", "WTAppliedF", "BoeReserev", "AgentCode", "WTAppliedS", "EquVatSum", "EquVatSumF", "EquVatSumS", "Installmnt", "VATFirst", "NnSbAmnt", "NnSbAmntSC", "NbSbAmntFC", "ExepAmnt", "ExepAmntSC", "ExepAmntFC", "VatDate", "CorrExt", "CorrInv", "NCorrInv", "CEECFlag", "BaseAmnt", "BaseAmntSC", "BaseAmntFC", "CtlAccount", "BPLId", "BPLName", "VATRegNum", "TxInvRptNo", "TxInvRptDt", "KVVATCode", "WTDetails", "SumAbsId", "SumRptDate", "PIndicator", "ManualNum", "UseShpdGd", "BaseVtAt", "BaseVtAtSC", "BaseVtAtFC", "NnSbVAt", "NnSbVAtSC", "NbSbVAtFC", "ExptVAt", "ExptVAtSC", "ExptVAtFC", "LYPmtAt", "LYPmtAtSC", "LYPmtAtFC", "ExpAnSum", "ExpAnSys", "ExpAnFrgn", "DocSubType", "DpmStatus", "DpmAmnt", "DpmAmntSC", "DpmAmntFC", "DpmDrawn", "DpmPrcnt", "PaidSum", "PaidSumFc", "PaidSumSc", "FolioPref", "FolioNum", "DpmAppl", "DpmApplFc", "DpmApplSc", "LPgFolioN", "Header", "Footer", "Posted", "OwnerCode", "BPChCode", "BPChCntc", "PayToCode", "IsPaytoBnk", "BnkCntry", "BankCode", "BnkAccount", "BnkBranch", "isIns", "TrackNo", "VersionNum", "LangCode", "BPNameOW", "BillToOW", "ShipToOW", "RetInvoice", "ClsDate", "MInvNum", "MInvDate", "SeqCode", "Serial", "SeriesStr", "SubStr", "Model", "TaxOnExp", "TaxOnExpFc", "TaxOnExpSc", "TaxOnExAp", "TaxOnExApF", "TaxOnExApS", "LastPmnTyp", "LndCstNum", "UseCorrVat", "BlkCredMmo", "OpenForLaC", "Excised", "ExcRefDate", "ExcRmvTime", "SrvGpPrcnt", "DepositNum", "CertNum", "DutyStatus", "AutoCrtFlw", "FlwRefDate", "FlwRefNum", "VatJENum", "DpmVat", "DpmVatFc", "DpmVatSc", "DpmAppVat", "DpmAppVatF", "DpmAppVatS", "InsurOp347", "IgnRelDoc", "BuildDesc", "ResidenNum", "Checker", "Payee", "CopyNumber", "SSIExmpt", "PQTGrpSer", "PQTGrpNum", "PQTGrpHW", "ReopOriDoc", "ReopManCls", "DocManClsd", "ClosingOpt", "SpecDate", "Ordered", "NTSApprov", "NTSWebSite", "NTSeTaxNo", "NTSApprNo", "PayDuMonth", "ExtraMonth", "ExtraDays", "CdcOffset", "SignMsg", "SignDigest", "CertifNum", "KeyVersion", "EDocGenTyp", "ESeries", "EDocNum", "EDocExpFrm", "OnlineQuo", "POSEqNum", "POSManufSN", "POSCashN", "EDocStatus", "EDocCntnt", "EDocProces", "EDocErrCod", "EDocErrMsg", "EDocCancel", "EDocTest", "EDocPrefix", "CUP", "CIG", "DpmAsDscnt", "Attachment", "AtcEntry", "SupplCode", "GTSRlvnt", "BaseDisc", "BaseDiscSc", "BaseDiscFc", "BaseDiscPr", "CreateTS", "UpdateTS", "SrvTaxRule", "AnnInvDecR", "Supplier", "Releaser", "Receiver", "ToWhsCode", "AssetDate", "Requester", "ReqName", "Branch", "Department", "Email", "Notify", "ReqType", "OriginType", "IsReuseNum", "IsReuseNFN", "DocDlvry", "PaidDpm", "PaidDpmF", "PaidDpmS", "EnvTypeNFe", "AgrNo", "IsAlt", "AltBaseTyp", "AltBaseEnt", "AuthCode", "StDlvDate", "StDlvTime", "EndDlvDate", "EndDlvTime", "VclPlate", "ElCoStatus", "AtDocType", "ElCoMsg", "PrintSEPA", "FreeChrg", "FreeChrgFC", "FreeChrgSC", "NfeValue", "FiscDocNum", "RelatedTyp", "RelatedEnt", "CCDEntry", "NfePrntFo", "ZrdAbs", "POSRcptNo", "FoCTax", "FoCTaxFC", "FoCTaxSC", "TpCusPres", "ExcDocDate", "FoCFrght", "FoCFrghtFC", "FoCFrghtSC", "InterimTyp", "PTICode", "Letter", "FolNumFrom", "FolNumTo", "FolSeries", "SplitTax", "SplitTaxFC", "SplitTaxSC", "ToBinCode", "PriceMode", "PoDropPrss", "PermitNo", "MYFtype", "DocTaxID", "DateReport", "RepSection", "ExclTaxRep", "PosCashReg", "DmpTransID", "ECommerBP", "EComerGSTN", "Revision", "RevRefNo", "RevRefDate", "RevCreRefN", "RevCreRefD", "TaxInvNo", "FrmBpDate", "GSTTranTyp", "BaseType", "BaseEntry", "ComTrade", "UseBilAddr", "IssReason", "ComTradeRt", "SplitPmnt", "SOIWizId", "SelfPosted", "EnBnkAcct", "EncryptIV", "DPPStatus", "SAPPassprt", "EWBGenType", "CtActTax", "CtActTaxFC", "CtActTaxSC", "EDocType", "QRCodeSrc", "AggregDoc", "DataVers", "ShipState", "ShipPlace", "CustOffice", "FCI", "NnSbCuAmnt", "NnSbCuSC", "NnSbCuFC", "ExepCuAmnt", "ExepCuSC", "ExepCuFC", "AddLegIn", "LegTextF", "IndFinal", "DANFELgTxt", "PostPmntWT", "QRCodeSPGn", "FCEPmnMean", "ReqCode", "NotRel4MI", "Rel4PPTax", "U_POSFCOffline", "U_POSHCOffline", "U_POSLIdOffline", "U_ClaveFE", "U_Provincia", "U_Canton", "U_Distrito", "U_Barrio", "U_Direccion", "U_CLVS_POS_UniqueInvId", "U_DocDateOffline", "U_DocTimeOffline", "U_Online", "U_User", "U_ListNum", "U_FeNumProvRef", "U_BatchId", "U_DocumentKey", "U_NumIdentFE", "U_TipoIdentificacion", "U_EMA_numTransaccion_acumular", "U_EMA_Approval_Status", "U_EMA_numTransaccion_redimir", "U_TipoDocE", "U_CorreoFE" ) AS SELECT "DRAFT"."DocEntry" , "DRAFT"."DocNum" , "DRAFT"."DocType" , "DRAFT"."CANCELED" , "DRAFT"."Handwrtten" , "DRAFT"."Printed" , "DRAFT"."DocStatus" , "DRAFT"."InvntSttus" , "DRAFT"."Transfered" , "DRAFT"."ObjType" , "DRAFT"."DocDate" , "DRAFT"."DocDueDate" , "DRAFT"."CardCode" , "DRAFT"."CardName" , "DRAFT"."Address" , "DRAFT"."NumAtCard" , "DRAFT"."VatPercent" , "DRAFT"."VatSum" , "DRAFT"."VatSumFC" , "DRAFT"."DiscPrcnt" , "DRAFT"."DiscSum" , "DRAFT"."DiscSumFC" , "DRAFT"."DocCur" , "DRAFT"."DocRate" , "DRAFT"."DocTotal" , "DRAFT"."DocTotalFC" , "DRAFT"."PaidToDate" , "DRAFT"."PaidFC" , "DRAFT"."GrosProfit" , "DRAFT"."GrosProfFC" , "DRAFT"."Ref1" , "DRAFT"."Ref2" , "DRAFT"."Comments" , "DRAFT"."JrnlMemo" , "DRAFT"."TransId" , "DRAFT"."ReceiptNum" , "DRAFT"."GroupNum" , "DRAFT"."DocTime" , "DRAFT"."SlpCode" , "DRAFT"."TrnspCode" , "DRAFT"."PartSupply" , "DRAFT"."Confirmed" , "DRAFT"."GrossBase" , "DRAFT"."ImportEnt" , "DRAFT"."CreateTran" , "DRAFT"."SummryType" , "DRAFT"."UpdInvnt" , "DRAFT"."UpdCardBal" , "DRAFT"."Instance" , "DRAFT"."Flags" , "DRAFT"."InvntDirec" , "DRAFT"."CntctCode" , "DRAFT"."ShowSCN" , "DRAFT"."FatherCard" , "DRAFT"."SysRate" , "DRAFT"."CurSource" , "DRAFT"."VatSumSy" , "DRAFT"."DiscSumSy" , "DRAFT"."DocTotalSy" , "DRAFT"."PaidSys" , "DRAFT"."FatherType" , "DRAFT"."GrosProfSy" , "DRAFT"."UpdateDate" , "DRAFT"."IsICT" , "DRAFT"."CreateDate" , "DRAFT"."Volume" , "DRAFT"."VolUnit" , "DRAFT"."Weight" , "DRAFT"."WeightUnit" , "DRAFT"."Series" , "DRAFT"."TaxDate" , "DRAFT"."Filler" , "DRAFT"."DataSource" , "DRAFT"."StampNum" , "DRAFT"."isCrin" , "DRAFT"."FinncPriod" , "DRAFT"."UserSign" , "DRAFT"."selfInv" , "DRAFT"."VatPaid" , "DRAFT"."VatPaidFC" , "DRAFT"."VatPaidSys" , "DRAFT"."UserSign2" , "DRAFT"."WddStatus" , "DRAFT"."draftKey" , "DRAFT"."TotalExpns" , "DRAFT"."TotalExpFC" , "DRAFT"."TotalExpSC" , "DRAFT"."DunnLevel" , "DRAFT"."Address2" , "DRAFT"."LogInstanc" , "DRAFT"."Exported" , "DRAFT"."StationID" , "DRAFT"."Indicator" , "DRAFT"."NetProc" , "DRAFT"."AqcsTax" , "DRAFT"."AqcsTaxFC" , "DRAFT"."AqcsTaxSC" , "DRAFT"."CashDiscPr" , "DRAFT"."CashDiscnt" , "DRAFT"."CashDiscFC" , "DRAFT"."CashDiscSC" , "DRAFT"."ShipToCode" , "DRAFT"."LicTradNum" , "DRAFT"."PaymentRef" , "DRAFT"."WTSum" , "DRAFT"."WTSumFC" , "DRAFT"."WTSumSC" , "DRAFT"."RoundDif" , "DRAFT"."RoundDifFC" , "DRAFT"."RoundDifSy" , "DRAFT"."CheckDigit" , "DRAFT"."Form1099" , "DRAFT"."Box1099" , "DRAFT"."submitted" , "DRAFT"."PoPrss" , "DRAFT"."Rounding" , "DRAFT"."RevisionPo" , "DRAFT"."Segment" , "DRAFT"."ReqDate" , "DRAFT"."CancelDate" , "DRAFT"."PickStatus" , "DRAFT"."Pick" , "DRAFT"."BlockDunn" , "DRAFT"."PeyMethod" , "DRAFT"."PayBlock" , "DRAFT"."PayBlckRef" , "DRAFT"."MaxDscn" , "DRAFT"."Reserve" , "DRAFT"."Max1099" , "DRAFT"."CntrlBnk" , "DRAFT"."PickRmrk" , "DRAFT"."ISRCodLine" , "DRAFT"."ExpAppl" , "DRAFT"."ExpApplFC" , "DRAFT"."ExpApplSC" , "DRAFT"."Project" , "DRAFT"."DeferrTax" , "DRAFT"."LetterNum" , "DRAFT"."FromDate" , "DRAFT"."ToDate" , "DRAFT"."WTApplied" , "DRAFT"."WTAppliedF" , "DRAFT"."BoeReserev" , "DRAFT"."AgentCode" , "DRAFT"."WTAppliedS" , "DRAFT"."EquVatSum" , "DRAFT"."EquVatSumF" , "DRAFT"."EquVatSumS" , "DRAFT"."Installmnt" , "DRAFT"."VATFirst" , "DRAFT"."NnSbAmnt" , "DRAFT"."NnSbAmntSC" , "DRAFT"."NbSbAmntFC" , "DRAFT"."ExepAmnt" , "DRAFT"."ExepAmntSC" , "DRAFT"."ExepAmntFC" , "DRAFT"."VatDate" , "DRAFT"."CorrExt" , "DRAFT"."CorrInv" , "DRAFT"."NCorrInv" , "DRAFT"."CEECFlag" , "DRAFT"."BaseAmnt" , "DRAFT"."BaseAmntSC" , "DRAFT"."BaseAmntFC" , "DRAFT"."CtlAccount" , "DRAFT"."BPLId" , "DRAFT"."BPLName" , "DRAFT"."VATRegNum" , "DRAFT"."TxInvRptNo" , "DRAFT"."TxInvRptDt" , "DRAFT"."KVVATCode" , "DRAFT"."WTDetails" , "DRAFT"."SumAbsId" , "DRAFT"."SumRptDate" , "DRAFT"."PIndicator" , "DRAFT"."ManualNum" , "DRAFT"."UseShpdGd" , "DRAFT"."BaseVtAt" , "DRAFT"."BaseVtAtSC" , "DRAFT"."BaseVtAtFC" , "DRAFT"."NnSbVAt" , "DRAFT"."NnSbVAtSC" , "DRAFT"."NbSbVAtFC" , "DRAFT"."ExptVAt" , "DRAFT"."ExptVAtSC" , "DRAFT"."ExptVAtFC" , "DRAFT"."LYPmtAt" , "DRAFT"."LYPmtAtSC" , "DRAFT"."LYPmtAtFC" , "DRAFT"."ExpAnSum" , "DRAFT"."ExpAnSys" , "DRAFT"."ExpAnFrgn" , "DRAFT"."DocSubType" , "DRAFT"."DpmStatus" , "DRAFT"."DpmAmnt" , "DRAFT"."DpmAmntSC" , "DRAFT"."DpmAmntFC" , "DRAFT"."DpmDrawn" , "DRAFT"."DpmPrcnt" , "DRAFT"."PaidSum" , "DRAFT"."PaidSumFc" , "DRAFT"."PaidSumSc" , "DRAFT"."FolioPref" , "DRAFT"."FolioNum" , "DRAFT"."DpmAppl" , "DRAFT"."DpmApplFc" , "DRAFT"."DpmApplSc" , "DRAFT"."LPgFolioN" , "DRAFT"."Header" , "DRAFT"."Footer" , "DRAFT"."Posted" , "DRAFT"."OwnerCode" , "DRAFT"."BPChCode" , "DRAFT"."BPChCntc" , "DRAFT"."PayToCode" , "DRAFT"."IsPaytoBnk" , "DRAFT"."BnkCntry" , "DRAFT"."BankCode" , "DRAFT"."BnkAccount" , "DRAFT"."BnkBranch" , "DRAFT"."isIns" , "DRAFT"."TrackNo" , "DRAFT"."VersionNum" , "DRAFT"."LangCode" , "DRAFT"."BPNameOW" , "DRAFT"."BillToOW" , "DRAFT"."ShipToOW" , "DRAFT"."RetInvoice" , "DRAFT"."ClsDate" , "DRAFT"."MInvNum" , "DRAFT"."MInvDate" , "DRAFT"."SeqCode" , "DRAFT"."Serial" , "DRAFT"."SeriesStr" , "DRAFT"."SubStr" , "DRAFT"."Model" , "DRAFT"."TaxOnExp" , "DRAFT"."TaxOnExpFc" , "DRAFT"."TaxOnExpSc" , "DRAFT"."TaxOnExAp" , "DRAFT"."TaxOnExApF" , "DRAFT"."TaxOnExApS" , "DRAFT"."LastPmnTyp" , "DRAFT"."LndCstNum" , "DRAFT"."UseCorrVat" , "DRAFT"."BlkCredMmo" , "DRAFT"."OpenForLaC" , "DRAFT"."Excised" , "DRAFT"."ExcRefDate" , "DRAFT"."ExcRmvTime" , "DRAFT"."SrvGpPrcnt" , "DRAFT"."DepositNum" , "DRAFT"."CertNum" , "DRAFT"."DutyStatus" , "DRAFT"."AutoCrtFlw" , "DRAFT"."FlwRefDate" , "DRAFT"."FlwRefNum" , "DRAFT"."VatJENum" , "DRAFT"."DpmVat" , "DRAFT"."DpmVatFc" , "DRAFT"."DpmVatSc" , "DRAFT"."DpmAppVat" , "DRAFT"."DpmAppVatF" , "DRAFT"."DpmAppVatS" , "DRAFT"."InsurOp347" , "DRAFT"."IgnRelDoc" , "DRAFT"."BuildDesc" , "DRAFT"."ResidenNum" , "DRAFT"."Checker" , "DRAFT"."Payee" , "DRAFT"."CopyNumber" , "DRAFT"."SSIExmpt" , "DRAFT"."PQTGrpSer" , "DRAFT"."PQTGrpNum" , "DRAFT"."PQTGrpHW" , "DRAFT"."ReopOriDoc" , "DRAFT"."ReopManCls" , "DRAFT"."DocManClsd" , "DRAFT"."ClosingOpt" , "DRAFT"."SpecDate" , "DRAFT"."Ordered" , "DRAFT"."NTSApprov" , "DRAFT"."NTSWebSite" , "DRAFT"."NTSeTaxNo" , "DRAFT"."NTSApprNo" , "DRAFT"."PayDuMonth" , "DRAFT"."ExtraMonth" , "DRAFT"."ExtraDays" , "DRAFT"."CdcOffset" , "DRAFT"."SignMsg" , "DRAFT"."SignDigest" , "DRAFT"."CertifNum" , "DRAFT"."KeyVersion" , "DRAFT"."EDocGenTyp" , "DRAFT"."ESeries" , "DRAFT"."EDocNum" , "DRAFT"."EDocExpFrm" , "DRAFT"."OnlineQuo" , "DRAFT"."POSEqNum" , "DRAFT"."POSManufSN" , "DRAFT"."POSCashN" , "DRAFT"."EDocStatus" , "DRAFT"."EDocCntnt" , "DRAFT"."EDocProces" , "DRAFT"."EDocErrCod" , "DRAFT"."EDocErrMsg" , "DRAFT"."EDocCancel" , "DRAFT"."EDocTest" , "DRAFT"."EDocPrefix" , "DRAFT"."CUP" , "DRAFT"."CIG" , "DRAFT"."DpmAsDscnt" , "DRAFT"."Attachment" , "DRAFT"."AtcEntry" , "DRAFT"."SupplCode" , "DRAFT"."GTSRlvnt" , "DRAFT"."BaseDisc" , "DRAFT"."BaseDiscSc" , "DRAFT"."BaseDiscFc" , "DRAFT"."BaseDiscPr" , "DRAFT"."CreateTS" , "DRAFT"."UpdateTS" , "DRAFT"."SrvTaxRule" , "DRAFT"."AnnInvDecR" , "DRAFT"."Supplier" , "DRAFT"."Releaser" , "DRAFT"."Receiver" , "DRAFT"."ToWhsCode" , "DRAFT"."AssetDate" , "DRAFT"."Requester" , "DRAFT"."ReqName" , "DRAFT"."Branch" , "DRAFT"."Department" , "DRAFT"."Email" , "DRAFT"."Notify" , "DRAFT"."ReqType" , "DRAFT"."OriginType" , "DRAFT"."IsReuseNum" , "DRAFT"."IsReuseNFN" , "DRAFT"."DocDlvry" , "DRAFT"."PaidDpm" , "DRAFT"."PaidDpmF" , "DRAFT"."PaidDpmS" , "DRAFT"."EnvTypeNFe" , "DRAFT"."AgrNo" , "DRAFT"."IsAlt" , "DRAFT"."AltBaseTyp" , "DRAFT"."AltBaseEnt" , "DRAFT"."AuthCode" , "DRAFT"."StDlvDate" , "DRAFT"."StDlvTime" , "DRAFT"."EndDlvDate" , "DRAFT"."EndDlvTime" , "DRAFT"."VclPlate" , "DRAFT"."ElCoStatus" , "DRAFT"."AtDocType" , "DRAFT"."ElCoMsg" , "DRAFT"."PrintSEPA" , "DRAFT"."FreeChrg" , "DRAFT"."FreeChrgFC" , "DRAFT"."FreeChrgSC" , "DRAFT"."NfeValue" , "DRAFT"."FiscDocNum" , "DRAFT"."RelatedTyp" , "DRAFT"."RelatedEnt" , "DRAFT"."CCDEntry" , "DRAFT"."NfePrntFo" , "DRAFT"."ZrdAbs" , "DRAFT"."POSRcptNo" , "DRAFT"."FoCTax" , "DRAFT"."FoCTaxFC" , "DRAFT"."FoCTaxSC" , "DRAFT"."TpCusPres" , "DRAFT"."ExcDocDate" , "DRAFT"."FoCFrght" , "DRAFT"."FoCFrghtFC" , "DRAFT"."FoCFrghtSC" , "DRAFT"."InterimTyp" , "DRAFT"."PTICode" , "DRAFT"."Letter" , "DRAFT"."FolNumFrom" , "DRAFT"."FolNumTo" , "DRAFT"."FolSeries" , "DRAFT"."SplitTax" , "DRAFT"."SplitTaxFC" , "DRAFT"."SplitTaxSC" , "DRAFT"."ToBinCode" , "DRAFT"."PriceMode" , "DRAFT"."PoDropPrss" , "DRAFT"."PermitNo" , "DRAFT"."MYFtype" , "DRAFT"."DocTaxID" , "DRAFT"."DateReport" , "DRAFT"."RepSection" , "DRAFT"."ExclTaxRep" , "DRAFT"."PosCashReg" , "DRAFT"."DmpTransID" , "DRAFT"."ECommerBP" , "DRAFT"."EComerGSTN" , "DRAFT"."Revision" , "DRAFT"."RevRefNo" , "DRAFT"."RevRefDate" , "DRAFT"."RevCreRefN" , "DRAFT"."RevCreRefD" , "DRAFT"."TaxInvNo" , "DRAFT"."FrmBpDate" , "DRAFT"."GSTTranTyp" , "DRAFT"."BaseType" , "DRAFT"."BaseEntry" , "DRAFT"."ComTrade" , "DRAFT"."UseBilAddr" , "DRAFT"."IssReason" , "DRAFT"."ComTradeRt" , "DRAFT"."SplitPmnt" , "DRAFT"."SOIWizId" , "DRAFT"."SelfPosted" , "DRAFT"."EnBnkAcct" , "DRAFT"."EncryptIV" , "DRAFT"."DPPStatus" , "DRAFT"."SAPPassprt" , "DRAFT"."EWBGenType" , "DRAFT"."CtActTax" , "DRAFT"."CtActTaxFC" , "DRAFT"."CtActTaxSC" , "DRAFT"."EDocType" , "DRAFT"."QRCodeSrc" , "DRAFT"."AggregDoc" , "DRAFT"."DataVers" , "DRAFT"."ShipState" , "DRAFT"."ShipPlace" , "DRAFT"."CustOffice" , "DRAFT"."FCI" , "DRAFT"."NnSbCuAmnt" , "DRAFT"."NnSbCuSC" , "DRAFT"."NnSbCuFC" , "DRAFT"."ExepCuAmnt" , "DRAFT"."ExepCuSC" , "DRAFT"."ExepCuFC" , "DRAFT"."AddLegIn" , "DRAFT"."LegTextF" , "DRAFT"."IndFinal" , "DRAFT"."DANFELgTxt" , "DRAFT"."PostPmntWT" , "DRAFT"."QRCodeSPGn" , "DRAFT"."FCEPmnMean" , "DRAFT"."ReqCode" , "DRAFT"."NotRel4MI" , "DRAFT"."Rel4PPTax" , "DRAFT"."U_POSFCOffline" , "DRAFT"."U_POSHCOffline" , "DRAFT"."U_POSLIdOffline" , "DRAFT"."U_ClaveFE" , "DRAFT"."U_Provincia" , "DRAFT"."U_Canton" , "DRAFT"."U_Distrito" , "DRAFT"."U_Barrio" , "DRAFT"."U_Direccion" , "DRAFT"."U_CLVS_POS_UniqueInvId" , "DRAFT"."U_DocDateOffline" , "DRAFT"."U_DocTimeOffline" , "DRAFT"."U_Online" , "DRAFT"."U_User" , "DRAFT"."U_ListNum" , "DRAFT"."U_FeNumProvRef" , "DRAFT"."U_BatchId" , "DRAFT"."U_DocumentKey" , "DRAFT"."U_NumIdentFE" , "DRAFT"."U_TipoIdentificacion" , "DRAFT"."U_EMA_numTransaccion_acumular" , "DRAFT"."U_EMA_Approval_Status" , "DRAFT"."U_EMA_numTransaccion_redimir" , "DRAFT"."U_TipoDocE" , "DRAFT"."U_CorreoFE" FROM ODRF Draft;



--177-----------------------------------------------------------177--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_UDF_OINV_B1SLQuery" ( "DocEntry", "DocNum", "DocType", "CANCELED", "Handwrtten", "Printed", "DocStatus", "InvntSttus", "Transfered", "ObjType", "DocDate", "DocDueDate", "CardCode", "CardName", "Address", "NumAtCard", "VatPercent", "VatSum", "VatSumFC", "DiscPrcnt", "DiscSum", "DiscSumFC", "DocCur", "DocRate", "DocTotal", "DocTotalFC", "PaidToDate", "PaidFC", "GrosProfit", "GrosProfFC", "Ref1", "Ref2", "Comments", "JrnlMemo", "TransId", "ReceiptNum", "GroupNum", "DocTime", "SlpCode", "TrnspCode", "PartSupply", "Confirmed", "GrossBase", "ImportEnt", "CreateTran", "SummryType", "UpdInvnt", "UpdCardBal", "Instance", "Flags", "InvntDirec", "CntctCode", "ShowSCN", "FatherCard", "SysRate", "CurSource", "VatSumSy", "DiscSumSy", "DocTotalSy", "PaidSys", "FatherType", "GrosProfSy", "UpdateDate", "IsICT", "CreateDate", "Volume", "VolUnit", "Weight", "WeightUnit", "Series", "TaxDate", "Filler", "DataSource", "StampNum", "isCrin", "FinncPriod", "UserSign", "selfInv", "VatPaid", "VatPaidFC", "VatPaidSys", "UserSign2", "WddStatus", "draftKey", "TotalExpns", "TotalExpFC", "TotalExpSC", "DunnLevel", "Address2", "LogInstanc", "Exported", "StationID", "Indicator", "NetProc", "AqcsTax", "AqcsTaxFC", "AqcsTaxSC", "CashDiscPr", "CashDiscnt", "CashDiscFC", "CashDiscSC", "ShipToCode", "LicTradNum", "PaymentRef", "WTSum", "WTSumFC", "WTSumSC", "RoundDif", "RoundDifFC", "RoundDifSy", "CheckDigit", "Form1099", "Box1099", "submitted", "PoPrss", "Rounding", "RevisionPo", "Segment", "ReqDate", "CancelDate", "PickStatus", "Pick", "BlockDunn", "PeyMethod", "PayBlock", "PayBlckRef", "MaxDscn", "Reserve", "Max1099", "CntrlBnk", "PickRmrk", "ISRCodLine", "ExpAppl", "ExpApplFC", "ExpApplSC", "Project", "DeferrTax", "LetterNum", "FromDate", "ToDate", "WTApplied", "WTAppliedF", "BoeReserev", "AgentCode", "WTAppliedS", "EquVatSum", "EquVatSumF", "EquVatSumS", "Installmnt", "VATFirst", "NnSbAmnt", "NnSbAmntSC", "NbSbAmntFC", "ExepAmnt", "ExepAmntSC", "ExepAmntFC", "VatDate", "CorrExt", "CorrInv", "NCorrInv", "CEECFlag", "BaseAmnt", "BaseAmntSC", "BaseAmntFC", "CtlAccount", "BPLId", "BPLName", "VATRegNum", "TxInvRptNo", "TxInvRptDt", "KVVATCode", "WTDetails", "SumAbsId", "SumRptDate", "PIndicator", "ManualNum", "UseShpdGd", "BaseVtAt", "BaseVtAtSC", "BaseVtAtFC", "NnSbVAt", "NnSbVAtSC", "NbSbVAtFC", "ExptVAt", "ExptVAtSC", "ExptVAtFC", "LYPmtAt", "LYPmtAtSC", "LYPmtAtFC", "ExpAnSum", "ExpAnSys", "ExpAnFrgn", "DocSubType", "DpmStatus", "DpmAmnt", "DpmAmntSC", "DpmAmntFC", "DpmDrawn", "DpmPrcnt", "PaidSum", "PaidSumFc", "PaidSumSc", "FolioPref", "FolioNum", "DpmAppl", "DpmApplFc", "DpmApplSc", "LPgFolioN", "Header", "Footer", "Posted", "OwnerCode", "BPChCode", "BPChCntc", "PayToCode", "IsPaytoBnk", "BnkCntry", "BankCode", "BnkAccount", "BnkBranch", "isIns", "TrackNo", "VersionNum", "LangCode", "BPNameOW", "BillToOW", "ShipToOW", "RetInvoice", "ClsDate", "MInvNum", "MInvDate", "SeqCode", "Serial", "SeriesStr", "SubStr", "Model", "TaxOnExp", "TaxOnExpFc", "TaxOnExpSc", "TaxOnExAp", "TaxOnExApF", "TaxOnExApS", "LastPmnTyp", "LndCstNum", "UseCorrVat", "BlkCredMmo", "OpenForLaC", "Excised", "ExcRefDate", "ExcRmvTime", "SrvGpPrcnt", "DepositNum", "CertNum", "DutyStatus", "AutoCrtFlw", "FlwRefDate", "FlwRefNum", "VatJENum", "DpmVat", "DpmVatFc", "DpmVatSc", "DpmAppVat", "DpmAppVatF", "DpmAppVatS", "InsurOp347", "IgnRelDoc", "BuildDesc", "ResidenNum", "Checker", "Payee", "CopyNumber", "SSIExmpt", "PQTGrpSer", "PQTGrpNum", "PQTGrpHW", "ReopOriDoc", "ReopManCls", "DocManClsd", "ClosingOpt", "SpecDate", "Ordered", "NTSApprov", "NTSWebSite", "NTSeTaxNo", "NTSApprNo", "PayDuMonth", "ExtraMonth", "ExtraDays", "CdcOffset", "SignMsg", "SignDigest", "CertifNum", "KeyVersion", "EDocGenTyp", "ESeries", "EDocNum", "EDocExpFrm", "OnlineQuo", "POSEqNum", "POSManufSN", "POSCashN", "EDocStatus", "EDocCntnt", "EDocProces", "EDocErrCod", "EDocErrMsg", "EDocCancel", "EDocTest", "EDocPrefix", "CUP", "CIG", "DpmAsDscnt", "Attachment", "AtcEntry", "SupplCode", "GTSRlvnt", "BaseDisc", "BaseDiscSc", "BaseDiscFc", "BaseDiscPr", "CreateTS", "UpdateTS", "SrvTaxRule", "AnnInvDecR", "Supplier", "Releaser", "Receiver", "ToWhsCode", "AssetDate", "Requester", "ReqName", "Branch", "Department", "Email", "Notify", "ReqType", "OriginType", "IsReuseNum", "IsReuseNFN", "DocDlvry", "PaidDpm", "PaidDpmF", "PaidDpmS", "EnvTypeNFe", "AgrNo", "IsAlt", "AltBaseTyp", "AltBaseEnt", "AuthCode", "StDlvDate", "StDlvTime", "EndDlvDate", "EndDlvTime", "VclPlate", "ElCoStatus", "AtDocType", "ElCoMsg", "PrintSEPA", "FreeChrg", "FreeChrgFC", "FreeChrgSC", "NfeValue", "FiscDocNum", "RelatedTyp", "RelatedEnt", "CCDEntry", "NfePrntFo", "ZrdAbs", "POSRcptNo", "FoCTax", "FoCTaxFC", "FoCTaxSC", "TpCusPres", "ExcDocDate", "FoCFrght", "FoCFrghtFC", "FoCFrghtSC", "InterimTyp", "PTICode", "Letter", "FolNumFrom", "FolNumTo", "FolSeries", "SplitTax", "SplitTaxFC", "SplitTaxSC", "ToBinCode", "PriceMode", "PoDropPrss", "PermitNo", "MYFtype", "DocTaxID", "DateReport", "RepSection", "ExclTaxRep", "PosCashReg", "DmpTransID", "ECommerBP", "EComerGSTN", "Revision", "RevRefNo", "RevRefDate", "RevCreRefN", "RevCreRefD", "TaxInvNo", "FrmBpDate", "GSTTranTyp", "BaseType", "BaseEntry", "ComTrade", "UseBilAddr", "IssReason", "ComTradeRt", "SplitPmnt", "SOIWizId", "SelfPosted", "EnBnkAcct", "EncryptIV", "DPPStatus", "SAPPassprt", "EWBGenType", "CtActTax", "CtActTaxFC", "CtActTaxSC", "EDocType", "QRCodeSrc", "AggregDoc", "DataVers", "ShipState", "ShipPlace", "CustOffice", "FCI", "NnSbCuAmnt", "NnSbCuSC", "NnSbCuFC", "ExepCuAmnt", "ExepCuSC", "ExepCuFC", "AddLegIn", "LegTextF", "IndFinal", "DANFELgTxt", "PostPmntWT", "QRCodeSPGn", "FCEPmnMean", "ReqCode", "NotRel4MI", "Rel4PPTax", "U_POSFCOffline", "U_POSHCOffline", "U_POSLIdOffline", "U_ClaveFE", "U_Provincia", "U_Canton", "U_Distrito", "U_Barrio", "U_Direccion", "U_CLVS_POS_UniqueInvId", "U_DocDateOffline", "U_DocTimeOffline", "U_Online", "U_User", "U_ListNum", "U_FeNumProvRef", "U_BatchId", "U_DocumentKey", "U_NumIdentFE", "U_TipoIdentificacion", "U_EMA_numTransaccion_acumular", "U_EMA_Approval_Status", "U_EMA_numTransaccion_redimir", "U_TipoDocE", "U_CorreoFE" ) AS SELECT "ORD"."DocEntry" , "ORD"."DocNum" , "ORD"."DocType" , "ORD"."CANCELED" , "ORD"."Handwrtten" , "ORD"."Printed" , "ORD"."DocStatus" , "ORD"."InvntSttus" , "ORD"."Transfered" , "ORD"."ObjType" , "ORD"."DocDate" , "ORD"."DocDueDate" , "ORD"."CardCode" , "ORD"."CardName" , "ORD"."Address" , "ORD"."NumAtCard" , "ORD"."VatPercent" , "ORD"."VatSum" , "ORD"."VatSumFC" , "ORD"."DiscPrcnt" , "ORD"."DiscSum" , "ORD"."DiscSumFC" , "ORD"."DocCur" , "ORD"."DocRate" , "ORD"."DocTotal" , "ORD"."DocTotalFC" , "ORD"."PaidToDate" , "ORD"."PaidFC" , "ORD"."GrosProfit" , "ORD"."GrosProfFC" , "ORD"."Ref1" , "ORD"."Ref2" , "ORD"."Comments" , "ORD"."JrnlMemo" , "ORD"."TransId" , "ORD"."ReceiptNum" , "ORD"."GroupNum" , "ORD"."DocTime" , "ORD"."SlpCode" , "ORD"."TrnspCode" , "ORD"."PartSupply" , "ORD"."Confirmed" , "ORD"."GrossBase" , "ORD"."ImportEnt" , "ORD"."CreateTran" , "ORD"."SummryType" , "ORD"."UpdInvnt" , "ORD"."UpdCardBal" , "ORD"."Instance" , "ORD"."Flags" , "ORD"."InvntDirec" , "ORD"."CntctCode" , "ORD"."ShowSCN" , "ORD"."FatherCard" , "ORD"."SysRate" , "ORD"."CurSource" , "ORD"."VatSumSy" , "ORD"."DiscSumSy" , "ORD"."DocTotalSy" , "ORD"."PaidSys" , "ORD"."FatherType" , "ORD"."GrosProfSy" , "ORD"."UpdateDate" , "ORD"."IsICT" , "ORD"."CreateDate" , "ORD"."Volume" , "ORD"."VolUnit" , "ORD"."Weight" , "ORD"."WeightUnit" , "ORD"."Series" , "ORD"."TaxDate" , "ORD"."Filler" , "ORD"."DataSource" , "ORD"."StampNum" , "ORD"."isCrin" , "ORD"."FinncPriod" , "ORD"."UserSign" , "ORD"."selfInv" , "ORD"."VatPaid" , "ORD"."VatPaidFC" , "ORD"."VatPaidSys" , "ORD"."UserSign2" , "ORD"."WddStatus" , "ORD"."draftKey" , "ORD"."TotalExpns" , "ORD"."TotalExpFC" , "ORD"."TotalExpSC" , "ORD"."DunnLevel" , "ORD"."Address2" , "ORD"."LogInstanc" , "ORD"."Exported" , "ORD"."StationID" , "ORD"."Indicator" , "ORD"."NetProc" , "ORD"."AqcsTax" , "ORD"."AqcsTaxFC" , "ORD"."AqcsTaxSC" , "ORD"."CashDiscPr" , "ORD"."CashDiscnt" , "ORD"."CashDiscFC" , "ORD"."CashDiscSC" , "ORD"."ShipToCode" , "ORD"."LicTradNum" , "ORD"."PaymentRef" , "ORD"."WTSum" , "ORD"."WTSumFC" , "ORD"."WTSumSC" , "ORD"."RoundDif" , "ORD"."RoundDifFC" , "ORD"."RoundDifSy" , "ORD"."CheckDigit" , "ORD"."Form1099" , "ORD"."Box1099" , "ORD"."submitted" , "ORD"."PoPrss" , "ORD"."Rounding" , "ORD"."RevisionPo" , "ORD"."Segment" , "ORD"."ReqDate" , "ORD"."CancelDate" , "ORD"."PickStatus" , "ORD"."Pick" , "ORD"."BlockDunn" , "ORD"."PeyMethod" , "ORD"."PayBlock" , "ORD"."PayBlckRef" , "ORD"."MaxDscn" , "ORD"."Reserve" , "ORD"."Max1099" , "ORD"."CntrlBnk" , "ORD"."PickRmrk" , "ORD"."ISRCodLine" , "ORD"."ExpAppl" , "ORD"."ExpApplFC" , "ORD"."ExpApplSC" , "ORD"."Project" , "ORD"."DeferrTax" , "ORD"."LetterNum" , "ORD"."FromDate" , "ORD"."ToDate" , "ORD"."WTApplied" , "ORD"."WTAppliedF" , "ORD"."BoeReserev" , "ORD"."AgentCode" , "ORD"."WTAppliedS" , "ORD"."EquVatSum" , "ORD"."EquVatSumF" , "ORD"."EquVatSumS" , "ORD"."Installmnt" , "ORD"."VATFirst" , "ORD"."NnSbAmnt" , "ORD"."NnSbAmntSC" , "ORD"."NbSbAmntFC" , "ORD"."ExepAmnt" , "ORD"."ExepAmntSC" , "ORD"."ExepAmntFC" , "ORD"."VatDate" , "ORD"."CorrExt" , "ORD"."CorrInv" , "ORD"."NCorrInv" , "ORD"."CEECFlag" , "ORD"."BaseAmnt" , "ORD"."BaseAmntSC" , "ORD"."BaseAmntFC" , "ORD"."CtlAccount" , "ORD"."BPLId" , "ORD"."BPLName" , "ORD"."VATRegNum" , "ORD"."TxInvRptNo" , "ORD"."TxInvRptDt" , "ORD"."KVVATCode" , "ORD"."WTDetails" , "ORD"."SumAbsId" , "ORD"."SumRptDate" , "ORD"."PIndicator" , "ORD"."ManualNum" , "ORD"."UseShpdGd" , "ORD"."BaseVtAt" , "ORD"."BaseVtAtSC" , "ORD"."BaseVtAtFC" , "ORD"."NnSbVAt" , "ORD"."NnSbVAtSC" , "ORD"."NbSbVAtFC" , "ORD"."ExptVAt" , "ORD"."ExptVAtSC" , "ORD"."ExptVAtFC" , "ORD"."LYPmtAt" , "ORD"."LYPmtAtSC" , "ORD"."LYPmtAtFC" , "ORD"."ExpAnSum" , "ORD"."ExpAnSys" , "ORD"."ExpAnFrgn" , "ORD"."DocSubType" , "ORD"."DpmStatus" , "ORD"."DpmAmnt" , "ORD"."DpmAmntSC" , "ORD"."DpmAmntFC" , "ORD"."DpmDrawn" , "ORD"."DpmPrcnt" , "ORD"."PaidSum" , "ORD"."PaidSumFc" , "ORD"."PaidSumSc" , "ORD"."FolioPref" , "ORD"."FolioNum" , "ORD"."DpmAppl" , "ORD"."DpmApplFc" , "ORD"."DpmApplSc" , "ORD"."LPgFolioN" , "ORD"."Header" , "ORD"."Footer" , "ORD"."Posted" , "ORD"."OwnerCode" , "ORD"."BPChCode" , "ORD"."BPChCntc" , "ORD"."PayToCode" , "ORD"."IsPaytoBnk" , "ORD"."BnkCntry" , "ORD"."BankCode" , "ORD"."BnkAccount" , "ORD"."BnkBranch" , "ORD"."isIns" , "ORD"."TrackNo" , "ORD"."VersionNum" , "ORD"."LangCode" , "ORD"."BPNameOW" , "ORD"."BillToOW" , "ORD"."ShipToOW" , "ORD"."RetInvoice" , "ORD"."ClsDate" , "ORD"."MInvNum" , "ORD"."MInvDate" , "ORD"."SeqCode" , "ORD"."Serial" , "ORD"."SeriesStr" , "ORD"."SubStr" , "ORD"."Model" , "ORD"."TaxOnExp" , "ORD"."TaxOnExpFc" , "ORD"."TaxOnExpSc" , "ORD"."TaxOnExAp" , "ORD"."TaxOnExApF" , "ORD"."TaxOnExApS" , "ORD"."LastPmnTyp" , "ORD"."LndCstNum" , "ORD"."UseCorrVat" , "ORD"."BlkCredMmo" , "ORD"."OpenForLaC" , "ORD"."Excised" , "ORD"."ExcRefDate" , "ORD"."ExcRmvTime" , "ORD"."SrvGpPrcnt" , "ORD"."DepositNum" , "ORD"."CertNum" , "ORD"."DutyStatus" , "ORD"."AutoCrtFlw" , "ORD"."FlwRefDate" , "ORD"."FlwRefNum" , "ORD"."VatJENum" , "ORD"."DpmVat" , "ORD"."DpmVatFc" , "ORD"."DpmVatSc" , "ORD"."DpmAppVat" , "ORD"."DpmAppVatF" , "ORD"."DpmAppVatS" , "ORD"."InsurOp347" , "ORD"."IgnRelDoc" , "ORD"."BuildDesc" , "ORD"."ResidenNum" , "ORD"."Checker" , "ORD"."Payee" , "ORD"."CopyNumber" , "ORD"."SSIExmpt" , "ORD"."PQTGrpSer" , "ORD"."PQTGrpNum" , "ORD"."PQTGrpHW" , "ORD"."ReopOriDoc" , "ORD"."ReopManCls" , "ORD"."DocManClsd" , "ORD"."ClosingOpt" , "ORD"."SpecDate" , "ORD"."Ordered" , "ORD"."NTSApprov" , "ORD"."NTSWebSite" , "ORD"."NTSeTaxNo" , "ORD"."NTSApprNo" , "ORD"."PayDuMonth" , "ORD"."ExtraMonth" , "ORD"."ExtraDays" , "ORD"."CdcOffset" , "ORD"."SignMsg" , "ORD"."SignDigest" , "ORD"."CertifNum" , "ORD"."KeyVersion" , "ORD"."EDocGenTyp" , "ORD"."ESeries" , "ORD"."EDocNum" , "ORD"."EDocExpFrm" , "ORD"."OnlineQuo" , "ORD"."POSEqNum" , "ORD"."POSManufSN" , "ORD"."POSCashN" , "ORD"."EDocStatus" , "ORD"."EDocCntnt" , "ORD"."EDocProces" , "ORD"."EDocErrCod" , "ORD"."EDocErrMsg" , "ORD"."EDocCancel" , "ORD"."EDocTest" , "ORD"."EDocPrefix" , "ORD"."CUP" , "ORD"."CIG" , "ORD"."DpmAsDscnt" , "ORD"."Attachment" , "ORD"."AtcEntry" , "ORD"."SupplCode" , "ORD"."GTSRlvnt" , "ORD"."BaseDisc" , "ORD"."BaseDiscSc" , "ORD"."BaseDiscFc" , "ORD"."BaseDiscPr" , "ORD"."CreateTS" , "ORD"."UpdateTS" , "ORD"."SrvTaxRule" , "ORD"."AnnInvDecR" , "ORD"."Supplier" , "ORD"."Releaser" , "ORD"."Receiver" , "ORD"."ToWhsCode" , "ORD"."AssetDate" , "ORD"."Requester" , "ORD"."ReqName" , "ORD"."Branch" , "ORD"."Department" , "ORD"."Email" , "ORD"."Notify" , "ORD"."ReqType" , "ORD"."OriginType" , "ORD"."IsReuseNum" , "ORD"."IsReuseNFN" , "ORD"."DocDlvry" , "ORD"."PaidDpm" , "ORD"."PaidDpmF" , "ORD"."PaidDpmS" , "ORD"."EnvTypeNFe" , "ORD"."AgrNo" , "ORD"."IsAlt" , "ORD"."AltBaseTyp" , "ORD"."AltBaseEnt" , "ORD"."AuthCode" , "ORD"."StDlvDate" , "ORD"."StDlvTime" , "ORD"."EndDlvDate" , "ORD"."EndDlvTime" , "ORD"."VclPlate" , "ORD"."ElCoStatus" , "ORD"."AtDocType" , "ORD"."ElCoMsg" , "ORD"."PrintSEPA" , "ORD"."FreeChrg" , "ORD"."FreeChrgFC" , "ORD"."FreeChrgSC" , "ORD"."NfeValue" , "ORD"."FiscDocNum" , "ORD"."RelatedTyp" , "ORD"."RelatedEnt" , "ORD"."CCDEntry" , "ORD"."NfePrntFo" , "ORD"."ZrdAbs" , "ORD"."POSRcptNo" , "ORD"."FoCTax" , "ORD"."FoCTaxFC" , "ORD"."FoCTaxSC" , "ORD"."TpCusPres" , "ORD"."ExcDocDate" , "ORD"."FoCFrght" , "ORD"."FoCFrghtFC" , "ORD"."FoCFrghtSC" , "ORD"."InterimTyp" , "ORD"."PTICode" , "ORD"."Letter" , "ORD"."FolNumFrom" , "ORD"."FolNumTo" , "ORD"."FolSeries" , "ORD"."SplitTax" , "ORD"."SplitTaxFC" , "ORD"."SplitTaxSC" , "ORD"."ToBinCode" , "ORD"."PriceMode" , "ORD"."PoDropPrss" , "ORD"."PermitNo" , "ORD"."MYFtype" , "ORD"."DocTaxID" , "ORD"."DateReport" , "ORD"."RepSection" , "ORD"."ExclTaxRep" , "ORD"."PosCashReg" , "ORD"."DmpTransID" , "ORD"."ECommerBP" , "ORD"."EComerGSTN" , "ORD"."Revision" , "ORD"."RevRefNo" , "ORD"."RevRefDate" , "ORD"."RevCreRefN" , "ORD"."RevCreRefD" , "ORD"."TaxInvNo" , "ORD"."FrmBpDate" , "ORD"."GSTTranTyp" , "ORD"."BaseType" , "ORD"."BaseEntry" , "ORD"."ComTrade" , "ORD"."UseBilAddr" , "ORD"."IssReason" , "ORD"."ComTradeRt" , "ORD"."SplitPmnt" , "ORD"."SOIWizId" , "ORD"."SelfPosted" , "ORD"."EnBnkAcct" , "ORD"."EncryptIV" , "ORD"."DPPStatus" , "ORD"."SAPPassprt" , "ORD"."EWBGenType" , "ORD"."CtActTax" , "ORD"."CtActTaxFC" , "ORD"."CtActTaxSC" , "ORD"."EDocType" , "ORD"."QRCodeSrc" , "ORD"."AggregDoc" , "ORD"."DataVers" , "ORD"."ShipState" , "ORD"."ShipPlace" , "ORD"."CustOffice" , "ORD"."FCI" , "ORD"."NnSbCuAmnt" , "ORD"."NnSbCuSC" , "ORD"."NnSbCuFC" , "ORD"."ExepCuAmnt" , "ORD"."ExepCuSC" , "ORD"."ExepCuFC" , "ORD"."AddLegIn" , "ORD"."LegTextF" , "ORD"."IndFinal" , "ORD"."DANFELgTxt" , "ORD"."PostPmntWT" , "ORD"."QRCodeSPGn" , "ORD"."FCEPmnMean" , "ORD"."ReqCode" , "ORD"."NotRel4MI" , "ORD"."Rel4PPTax" , "ORD"."U_POSFCOffline" , "ORD"."U_POSHCOffline" , "ORD"."U_POSLIdOffline" , "ORD"."U_ClaveFE" , "ORD"."U_Provincia" , "ORD"."U_Canton" , "ORD"."U_Distrito" , "ORD"."U_Barrio" , "ORD"."U_Direccion" , "ORD"."U_CLVS_POS_UniqueInvId" , "ORD"."U_DocDateOffline" , "ORD"."U_DocTimeOffline" , "ORD"."U_Online" , "ORD"."U_User" , "ORD"."U_ListNum" , "ORD"."U_FeNumProvRef" , "ORD"."U_BatchId" , "ORD"."U_DocumentKey" , "ORD"."U_NumIdentFE" , "ORD"."U_TipoIdentificacion" , "ORD"."U_EMA_numTransaccion_acumular" , "ORD"."U_EMA_Approval_Status" , "ORD"."U_EMA_numTransaccion_redimir" , "ORD"."U_TipoDocE" , "ORD"."U_CorreoFE" FROM OINV AS Ord;



--178-----------------------------------------------------------178--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_UDF_OITM_B1SLQuery" ( "ItemCode", "ItemName", "FrgnName", "ItmsGrpCod", "CstGrpCode", "VatGourpSa", "CodeBars", "VATLiable", "PrchseItem", "SellItem", "InvntItem", "OnHand", "IsCommited", "OnOrder", "IncomeAcct", "ExmptIncom", "MaxLevel", "DfltWH", "CardCode", "SuppCatNum", "BuyUnitMsr", "NumInBuy", "ReorderQty", "MinLevel", "LstEvlPric", "LstEvlDate", "CustomPer", "Canceled", "MnufctTime", "WholSlsTax", "RetilrTax", "SpcialDisc", "DscountCod", "TrackSales", "SalUnitMsr", "NumInSale", "Consig", "QueryGroup", "Counted", "OpenBlnc", "EvalSystem", "UserSign", "FREE", "PicturName", "Transfered", "BlncTrnsfr", "UserText", "SerialNum", "CommisPcnt", "CommisSum", "CommisGrp", "TreeType", "TreeQty", "LastPurPrc", "LastPurCur", "LastPurDat", "ExitCur", "ExitPrice", "ExitWH", "AssetItem", "WasCounted", "ManSerNum", "SHeight1", "SHght1Unit", "SHeight2", "SHght2Unit", "SWidth1", "SWdth1Unit", "SWidth2", "SWdth2Unit", "SLength1", "SLen1Unit", "Slength2", "SLen2Unit", "SVolume", "SVolUnit", "SWeight1", "SWght1Unit", "SWeight2", "SWght2Unit", "BHeight1", "BHght1Unit", "BHeight2", "BHght2Unit", "BWidth1", "BWdth1Unit", "BWidth2", "BWdth2Unit", "BLength1", "BLen1Unit", "Blength2", "BLen2Unit", "BVolume", "BVolUnit", "BWeight1", "BWght1Unit", "BWeight2", "BWght2Unit", "FixCurrCms", "FirmCode", "LstSalDate", "QryGroup1", "QryGroup2", "QryGroup3", "QryGroup4", "QryGroup5", "QryGroup6", "QryGroup7", "QryGroup8", "QryGroup9", "QryGroup10", "QryGroup11", "QryGroup12", "QryGroup13", "QryGroup14", "QryGroup15", "QryGroup16", "QryGroup17", "QryGroup18", "QryGroup19", "QryGroup20", "QryGroup21", "QryGroup22", "QryGroup23", "QryGroup24", "QryGroup25", "QryGroup26", "QryGroup27", "QryGroup28", "QryGroup29", "QryGroup30", "QryGroup31", "QryGroup32", "QryGroup33", "QryGroup34", "QryGroup35", "QryGroup36", "QryGroup37", "QryGroup38", "QryGroup39", "QryGroup40", "QryGroup41", "QryGroup42", "QryGroup43", "QryGroup44", "QryGroup45", "QryGroup46", "QryGroup47", "QryGroup48", "QryGroup49", "QryGroup50", "QryGroup51", "QryGroup52", "QryGroup53", "QryGroup54", "QryGroup55", "QryGroup56", "QryGroup57", "QryGroup58", "QryGroup59", "QryGroup60", "QryGroup61", "QryGroup62", "QryGroup63", "QryGroup64", "CreateDate", "UpdateDate", "ExportCode", "SalFactor1", "SalFactor2", "SalFactor3", "SalFactor4", "PurFactor1", "PurFactor2", "PurFactor3", "PurFactor4", "SalFormula", "PurFormula", "VatGroupPu", "AvgPrice", "PurPackMsr", "PurPackUn", "SalPackMsr", "SalPackUn", "SCNCounter", "ManBtchNum", "ManOutOnly", "DataSource", "validFor", "validFrom", "validTo", "frozenFor", "frozenFrom", "frozenTo", "BlockOut", "ValidComm", "FrozenComm", "LogInstanc", "ObjType", "SWW", "Deleted", "DocEntry", "ExpensAcct", "FrgnInAcct", "ShipType", "GLMethod", "ECInAcct", "FrgnExpAcc", "ECExpAcc", "TaxType", "ByWh", "WTLiable", "ItemType", "WarrntTmpl", "BaseUnit", "CountryOrg", "StockValue", "Phantom", "IssueMthd", "FREE1", "PricingPrc", "MngMethod", "ReorderPnt", "InvntryUom", "PlaningSys", "PrcrmntMtd", "OrdrIntrvl", "OrdrMulti", "MinOrdrQty", "LeadTime", "IndirctTax", "TaxCodeAR", "TaxCodeAP", "OSvcCode", "ISvcCode", "ServiceGrp", "NCMCode", "MatType", "MatGrp", "ProductSrc", "ServiceCtg", "ItemClass", "Excisable", "ChapterID", "NotifyASN", "ProAssNum", "AssblValue", "DNFEntry", "UserSign2", "Spec", "TaxCtg", "Series", "Number", "FuelCode", "BeverTblC", "BeverGrpC", "BeverTM", "Attachment", "AtcEntry", "ToleranDay", "UgpEntry", "PUoMEntry", "SUoMEntry", "IUoMEntry", "IssuePriBy", "AssetClass", "AssetGroup", "InventryNo", "Technician", "Employee", "Location", "StatAsset", "Cession", "DeacAftUL", "AsstStatus", "CapDate", "AcqDate", "RetDate", "GLPickMeth", "NoDiscount", "MgrByQty", "AssetRmk1", "AssetRmk2", "AssetAmnt1", "AssetAmnt2", "DeprGroup", "AssetSerNo", "CntUnitMsr", "NumInCnt", "INUoMEntry", "OneBOneRec", "RuleCode", "ScsCode", "SpProdType", "IWeight1", "IWght1Unit", "IWeight2", "IWght2Unit", "CompoWH", "CreateTS", "UpdateTS", "VirtAstItm", "SouVirAsst", "InCostRoll", "PrdStdCst", "EnAstSeri", "LinkRsc", "OnHldPert", "onHldLimt", "PriceUnit", "GSTRelevnt", "SACEntry", "GstTaxCtg", "AssVal4WTR", "ExcImpQUoM", "ExcFixAmnt", "ExcRate", "SOIExc", "TNVED", "Imported", "AutoBatch", "CstmActing", "StdItemId", "CommClass", "TaxCatCode", "DataVers", "NVECode", "CESTCode", "CtrSealQty", "LegalText", "QRCodeSrc", "Traceable", "U_IVA", "U_Acabado", "U_ShortDescription", "U_MaxDiscITM" ) AS SELECT "ORD"."ItemCode" , "ORD"."ItemName" , "ORD"."FrgnName" , "ORD"."ItmsGrpCod" , "ORD"."CstGrpCode" , "ORD"."VatGourpSa" , "ORD"."CodeBars" , "ORD"."VATLiable" , "ORD"."PrchseItem" , "ORD"."SellItem" , "ORD"."InvntItem" , "ORD"."OnHand" , "ORD"."IsCommited" , "ORD"."OnOrder" , "ORD"."IncomeAcct" , "ORD"."ExmptIncom" , "ORD"."MaxLevel" , "ORD"."DfltWH" , "ORD"."CardCode" , "ORD"."SuppCatNum" , "ORD"."BuyUnitMsr" , "ORD"."NumInBuy" , "ORD"."ReorderQty" , "ORD"."MinLevel" , "ORD"."LstEvlPric" , "ORD"."LstEvlDate" , "ORD"."CustomPer" , "ORD"."Canceled" , "ORD"."MnufctTime" , "ORD"."WholSlsTax" , "ORD"."RetilrTax" , "ORD"."SpcialDisc" , "ORD"."DscountCod" , "ORD"."TrackSales" , "ORD"."SalUnitMsr" , "ORD"."NumInSale" , "ORD"."Consig" , "ORD"."QueryGroup" , "ORD"."Counted" , "ORD"."OpenBlnc" , "ORD"."EvalSystem" , "ORD"."UserSign" , "ORD"."FREE" , "ORD"."PicturName" , "ORD"."Transfered" , "ORD"."BlncTrnsfr" , "ORD"."UserText" , "ORD"."SerialNum" , "ORD"."CommisPcnt" , "ORD"."CommisSum" , "ORD"."CommisGrp" , "ORD"."TreeType" , "ORD"."TreeQty" , "ORD"."LastPurPrc" , "ORD"."LastPurCur" , "ORD"."LastPurDat" , "ORD"."ExitCur" , "ORD"."ExitPrice" , "ORD"."ExitWH" , "ORD"."AssetItem" , "ORD"."WasCounted" , "ORD"."ManSerNum" , "ORD"."SHeight1" , "ORD"."SHght1Unit" , "ORD"."SHeight2" , "ORD"."SHght2Unit" , "ORD"."SWidth1" , "ORD"."SWdth1Unit" , "ORD"."SWidth2" , "ORD"."SWdth2Unit" , "ORD"."SLength1" , "ORD"."SLen1Unit" , "ORD"."Slength2" , "ORD"."SLen2Unit" , "ORD"."SVolume" , "ORD"."SVolUnit" , "ORD"."SWeight1" , "ORD"."SWght1Unit" , "ORD"."SWeight2" , "ORD"."SWght2Unit" , "ORD"."BHeight1" , "ORD"."BHght1Unit" , "ORD"."BHeight2" , "ORD"."BHght2Unit" , "ORD"."BWidth1" , "ORD"."BWdth1Unit" , "ORD"."BWidth2" , "ORD"."BWdth2Unit" , "ORD"."BLength1" , "ORD"."BLen1Unit" , "ORD"."Blength2" , "ORD"."BLen2Unit" , "ORD"."BVolume" , "ORD"."BVolUnit" , "ORD"."BWeight1" , "ORD"."BWght1Unit" , "ORD"."BWeight2" , "ORD"."BWght2Unit" , "ORD"."FixCurrCms" , "ORD"."FirmCode" , "ORD"."LstSalDate" , "ORD"."QryGroup1" , "ORD"."QryGroup2" , "ORD"."QryGroup3" , "ORD"."QryGroup4" , "ORD"."QryGroup5" , "ORD"."QryGroup6" , "ORD"."QryGroup7" , "ORD"."QryGroup8" , "ORD"."QryGroup9" , "ORD"."QryGroup10" , "ORD"."QryGroup11" , "ORD"."QryGroup12" , "ORD"."QryGroup13" , "ORD"."QryGroup14" , "ORD"."QryGroup15" , "ORD"."QryGroup16" , "ORD"."QryGroup17" , "ORD"."QryGroup18" , "ORD"."QryGroup19" , "ORD"."QryGroup20" , "ORD"."QryGroup21" , "ORD"."QryGroup22" , "ORD"."QryGroup23" , "ORD"."QryGroup24" , "ORD"."QryGroup25" , "ORD"."QryGroup26" , "ORD"."QryGroup27" , "ORD"."QryGroup28" , "ORD"."QryGroup29" , "ORD"."QryGroup30" , "ORD"."QryGroup31" , "ORD"."QryGroup32" , "ORD"."QryGroup33" , "ORD"."QryGroup34" , "ORD"."QryGroup35" , "ORD"."QryGroup36" , "ORD"."QryGroup37" , "ORD"."QryGroup38" , "ORD"."QryGroup39" , "ORD"."QryGroup40" , "ORD"."QryGroup41" , "ORD"."QryGroup42" , "ORD"."QryGroup43" , "ORD"."QryGroup44" , "ORD"."QryGroup45" , "ORD"."QryGroup46" , "ORD"."QryGroup47" , "ORD"."QryGroup48" , "ORD"."QryGroup49" , "ORD"."QryGroup50" , "ORD"."QryGroup51" , "ORD"."QryGroup52" , "ORD"."QryGroup53" , "ORD"."QryGroup54" , "ORD"."QryGroup55" , "ORD"."QryGroup56" , "ORD"."QryGroup57" , "ORD"."QryGroup58" , "ORD"."QryGroup59" , "ORD"."QryGroup60" , "ORD"."QryGroup61" , "ORD"."QryGroup62" , "ORD"."QryGroup63" , "ORD"."QryGroup64" , "ORD"."CreateDate" , "ORD"."UpdateDate" , "ORD"."ExportCode" , "ORD"."SalFactor1" , "ORD"."SalFactor2" , "ORD"."SalFactor3" , "ORD"."SalFactor4" , "ORD"."PurFactor1" , "ORD"."PurFactor2" , "ORD"."PurFactor3" , "ORD"."PurFactor4" , "ORD"."SalFormula" , "ORD"."PurFormula" , "ORD"."VatGroupPu" , "ORD"."AvgPrice" , "ORD"."PurPackMsr" , "ORD"."PurPackUn" , "ORD"."SalPackMsr" , "ORD"."SalPackUn" , "ORD"."SCNCounter" , "ORD"."ManBtchNum" , "ORD"."ManOutOnly" , "ORD"."DataSource" , "ORD"."validFor" , "ORD"."validFrom" , "ORD"."validTo" , "ORD"."frozenFor" , "ORD"."frozenFrom" , "ORD"."frozenTo" , "ORD"."BlockOut" , "ORD"."ValidComm" , "ORD"."FrozenComm" , "ORD"."LogInstanc" , "ORD"."ObjType" , "ORD"."SWW" , "ORD"."Deleted" , "ORD"."DocEntry" , "ORD"."ExpensAcct" , "ORD"."FrgnInAcct" , "ORD"."ShipType" , "ORD"."GLMethod" , "ORD"."ECInAcct" , "ORD"."FrgnExpAcc" , "ORD"."ECExpAcc" , "ORD"."TaxType" , "ORD"."ByWh" , "ORD"."WTLiable" , "ORD"."ItemType" , "ORD"."WarrntTmpl" , "ORD"."BaseUnit" , "ORD"."CountryOrg" , "ORD"."StockValue" , "ORD"."Phantom" , "ORD"."IssueMthd" , "ORD"."FREE1" , "ORD"."PricingPrc" , "ORD"."MngMethod" , "ORD"."ReorderPnt" , "ORD"."InvntryUom" , "ORD"."PlaningSys" , "ORD"."PrcrmntMtd" , "ORD"."OrdrIntrvl" , "ORD"."OrdrMulti" , "ORD"."MinOrdrQty" , "ORD"."LeadTime" , "ORD"."IndirctTax" , "ORD"."TaxCodeAR" , "ORD"."TaxCodeAP" , "ORD"."OSvcCode" , "ORD"."ISvcCode" , "ORD"."ServiceGrp" , "ORD"."NCMCode" , "ORD"."MatType" , "ORD"."MatGrp" , "ORD"."ProductSrc" , "ORD"."ServiceCtg" , "ORD"."ItemClass" , "ORD"."Excisable" , "ORD"."ChapterID" , "ORD"."NotifyASN" , "ORD"."ProAssNum" , "ORD"."AssblValue" , "ORD"."DNFEntry" , "ORD"."UserSign2" , "ORD"."Spec" , "ORD"."TaxCtg" , "ORD"."Series" , "ORD"."Number" , "ORD"."FuelCode" , "ORD"."BeverTblC" , "ORD"."BeverGrpC" , "ORD"."BeverTM" , "ORD"."Attachment" , "ORD"."AtcEntry" , "ORD"."ToleranDay" , "ORD"."UgpEntry" , "ORD"."PUoMEntry" , "ORD"."SUoMEntry" , "ORD"."IUoMEntry" , "ORD"."IssuePriBy" , "ORD"."AssetClass" , "ORD"."AssetGroup" , "ORD"."InventryNo" , "ORD"."Technician" , "ORD"."Employee" , "ORD"."Location" , "ORD"."StatAsset" , "ORD"."Cession" , "ORD"."DeacAftUL" , "ORD"."AsstStatus" , "ORD"."CapDate" , "ORD"."AcqDate" , "ORD"."RetDate" , "ORD"."GLPickMeth" , "ORD"."NoDiscount" , "ORD"."MgrByQty" , "ORD"."AssetRmk1" , "ORD"."AssetRmk2" , "ORD"."AssetAmnt1" , "ORD"."AssetAmnt2" , "ORD"."DeprGroup" , "ORD"."AssetSerNo" , "ORD"."CntUnitMsr" , "ORD"."NumInCnt" , "ORD"."INUoMEntry" , "ORD"."OneBOneRec" , "ORD"."RuleCode" , "ORD"."ScsCode" , "ORD"."SpProdType" , "ORD"."IWeight1" , "ORD"."IWght1Unit" , "ORD"."IWeight2" , "ORD"."IWght2Unit" , "ORD"."CompoWH" , "ORD"."CreateTS" , "ORD"."UpdateTS" , "ORD"."VirtAstItm" , "ORD"."SouVirAsst" , "ORD"."InCostRoll" , "ORD"."PrdStdCst" , "ORD"."EnAstSeri" , "ORD"."LinkRsc" , "ORD"."OnHldPert" , "ORD"."onHldLimt" , "ORD"."PriceUnit" , "ORD"."GSTRelevnt" , "ORD"."SACEntry" , "ORD"."GstTaxCtg" , "ORD"."AssVal4WTR" , "ORD"."ExcImpQUoM" , "ORD"."ExcFixAmnt" , "ORD"."ExcRate" , "ORD"."SOIExc" , "ORD"."TNVED" , "ORD"."Imported" , "ORD"."AutoBatch" , "ORD"."CstmActing" , "ORD"."StdItemId" , "ORD"."CommClass" , "ORD"."TaxCatCode" , "ORD"."DataVers" , "ORD"."NVECode" , "ORD"."CESTCode" , "ORD"."CtrSealQty" , "ORD"."LegalText" , "ORD"."QRCodeSrc" , "ORD"."Traceable" , "ORD"."U_IVA" , "ORD"."U_Acabado" , "ORD"."U_ShortDescription" , "ORD"."U_MaxDiscITM" FROM OITM AS Ord;



--179-----------------------------------------------------------179--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_UDF_OPCH_B1SLQuery" ( "DocEntry", "DocNum", "DocType", "CANCELED", "Handwrtten", "Printed", "DocStatus", "InvntSttus", "Transfered", "ObjType", "DocDate", "DocDueDate", "CardCode", "CardName", "Address", "NumAtCard", "VatPercent", "VatSum", "VatSumFC", "DiscPrcnt", "DiscSum", "DiscSumFC", "DocCur", "DocRate", "DocTotal", "DocTotalFC", "PaidToDate", "PaidFC", "GrosProfit", "GrosProfFC", "Ref1", "Ref2", "Comments", "JrnlMemo", "TransId", "ReceiptNum", "GroupNum", "DocTime", "SlpCode", "TrnspCode", "PartSupply", "Confirmed", "GrossBase", "ImportEnt", "CreateTran", "SummryType", "UpdInvnt", "UpdCardBal", "Instance", "Flags", "InvntDirec", "CntctCode", "ShowSCN", "FatherCard", "SysRate", "CurSource", "VatSumSy", "DiscSumSy", "DocTotalSy", "PaidSys", "FatherType", "GrosProfSy", "UpdateDate", "IsICT", "CreateDate", "Volume", "VolUnit", "Weight", "WeightUnit", "Series", "TaxDate", "Filler", "DataSource", "StampNum", "isCrin", "FinncPriod", "UserSign", "selfInv", "VatPaid", "VatPaidFC", "VatPaidSys", "UserSign2", "WddStatus", "draftKey", "TotalExpns", "TotalExpFC", "TotalExpSC", "DunnLevel", "Address2", "LogInstanc", "Exported", "StationID", "Indicator", "NetProc", "AqcsTax", "AqcsTaxFC", "AqcsTaxSC", "CashDiscPr", "CashDiscnt", "CashDiscFC", "CashDiscSC", "ShipToCode", "LicTradNum", "PaymentRef", "WTSum", "WTSumFC", "WTSumSC", "RoundDif", "RoundDifFC", "RoundDifSy", "CheckDigit", "Form1099", "Box1099", "submitted", "PoPrss", "Rounding", "RevisionPo", "Segment", "ReqDate", "CancelDate", "PickStatus", "Pick", "BlockDunn", "PeyMethod", "PayBlock", "PayBlckRef", "MaxDscn", "Reserve", "Max1099", "CntrlBnk", "PickRmrk", "ISRCodLine", "ExpAppl", "ExpApplFC", "ExpApplSC", "Project", "DeferrTax", "LetterNum", "FromDate", "ToDate", "WTApplied", "WTAppliedF", "BoeReserev", "AgentCode", "WTAppliedS", "EquVatSum", "EquVatSumF", "EquVatSumS", "Installmnt", "VATFirst", "NnSbAmnt", "NnSbAmntSC", "NbSbAmntFC", "ExepAmnt", "ExepAmntSC", "ExepAmntFC", "VatDate", "CorrExt", "CorrInv", "NCorrInv", "CEECFlag", "BaseAmnt", "BaseAmntSC", "BaseAmntFC", "CtlAccount", "BPLId", "BPLName", "VATRegNum", "TxInvRptNo", "TxInvRptDt", "KVVATCode", "WTDetails", "SumAbsId", "SumRptDate", "PIndicator", "ManualNum", "UseShpdGd", "BaseVtAt", "BaseVtAtSC", "BaseVtAtFC", "NnSbVAt", "NnSbVAtSC", "NbSbVAtFC", "ExptVAt", "ExptVAtSC", "ExptVAtFC", "LYPmtAt", "LYPmtAtSC", "LYPmtAtFC", "ExpAnSum", "ExpAnSys", "ExpAnFrgn", "DocSubType", "DpmStatus", "DpmAmnt", "DpmAmntSC", "DpmAmntFC", "DpmDrawn", "DpmPrcnt", "PaidSum", "PaidSumFc", "PaidSumSc", "FolioPref", "FolioNum", "DpmAppl", "DpmApplFc", "DpmApplSc", "LPgFolioN", "Header", "Footer", "Posted", "OwnerCode", "BPChCode", "BPChCntc", "PayToCode", "IsPaytoBnk", "BnkCntry", "BankCode", "BnkAccount", "BnkBranch", "isIns", "TrackNo", "VersionNum", "LangCode", "BPNameOW", "BillToOW", "ShipToOW", "RetInvoice", "ClsDate", "MInvNum", "MInvDate", "SeqCode", "Serial", "SeriesStr", "SubStr", "Model", "TaxOnExp", "TaxOnExpFc", "TaxOnExpSc", "TaxOnExAp", "TaxOnExApF", "TaxOnExApS", "LastPmnTyp", "LndCstNum", "UseCorrVat", "BlkCredMmo", "OpenForLaC", "Excised", "ExcRefDate", "ExcRmvTime", "SrvGpPrcnt", "DepositNum", "CertNum", "DutyStatus", "AutoCrtFlw", "FlwRefDate", "FlwRefNum", "VatJENum", "DpmVat", "DpmVatFc", "DpmVatSc", "DpmAppVat", "DpmAppVatF", "DpmAppVatS", "InsurOp347", "IgnRelDoc", "BuildDesc", "ResidenNum", "Checker", "Payee", "CopyNumber", "SSIExmpt", "PQTGrpSer", "PQTGrpNum", "PQTGrpHW", "ReopOriDoc", "ReopManCls", "DocManClsd", "ClosingOpt", "SpecDate", "Ordered", "NTSApprov", "NTSWebSite", "NTSeTaxNo", "NTSApprNo", "PayDuMonth", "ExtraMonth", "ExtraDays", "CdcOffset", "SignMsg", "SignDigest", "CertifNum", "KeyVersion", "EDocGenTyp", "ESeries", "EDocNum", "EDocExpFrm", "OnlineQuo", "POSEqNum", "POSManufSN", "POSCashN", "EDocStatus", "EDocCntnt", "EDocProces", "EDocErrCod", "EDocErrMsg", "EDocCancel", "EDocTest", "EDocPrefix", "CUP", "CIG", "DpmAsDscnt", "Attachment", "AtcEntry", "SupplCode", "GTSRlvnt", "BaseDisc", "BaseDiscSc", "BaseDiscFc", "BaseDiscPr", "CreateTS", "UpdateTS", "SrvTaxRule", "AnnInvDecR", "Supplier", "Releaser", "Receiver", "ToWhsCode", "AssetDate", "Requester", "ReqName", "Branch", "Department", "Email", "Notify", "ReqType", "OriginType", "IsReuseNum", "IsReuseNFN", "DocDlvry", "PaidDpm", "PaidDpmF", "PaidDpmS", "EnvTypeNFe", "AgrNo", "IsAlt", "AltBaseTyp", "AltBaseEnt", "AuthCode", "StDlvDate", "StDlvTime", "EndDlvDate", "EndDlvTime", "VclPlate", "ElCoStatus", "AtDocType", "ElCoMsg", "PrintSEPA", "FreeChrg", "FreeChrgFC", "FreeChrgSC", "NfeValue", "FiscDocNum", "RelatedTyp", "RelatedEnt", "CCDEntry", "NfePrntFo", "ZrdAbs", "POSRcptNo", "FoCTax", "FoCTaxFC", "FoCTaxSC", "TpCusPres", "ExcDocDate", "FoCFrght", "FoCFrghtFC", "FoCFrghtSC", "InterimTyp", "PTICode", "Letter", "FolNumFrom", "FolNumTo", "FolSeries", "SplitTax", "SplitTaxFC", "SplitTaxSC", "ToBinCode", "PriceMode", "PoDropPrss", "PermitNo", "MYFtype", "DocTaxID", "DateReport", "RepSection", "ExclTaxRep", "PosCashReg", "DmpTransID", "ECommerBP", "EComerGSTN", "Revision", "RevRefNo", "RevRefDate", "RevCreRefN", "RevCreRefD", "TaxInvNo", "FrmBpDate", "GSTTranTyp", "BaseType", "BaseEntry", "ComTrade", "UseBilAddr", "IssReason", "ComTradeRt", "SplitPmnt", "SOIWizId", "SelfPosted", "EnBnkAcct", "EncryptIV", "DPPStatus", "SAPPassprt", "EWBGenType", "CtActTax", "CtActTaxFC", "CtActTaxSC", "EDocType", "QRCodeSrc", "AggregDoc", "DataVers", "ShipState", "ShipPlace", "CustOffice", "FCI", "NnSbCuAmnt", "NnSbCuSC", "NnSbCuFC", "ExepCuAmnt", "ExepCuSC", "ExepCuFC", "AddLegIn", "LegTextF", "IndFinal", "DANFELgTxt", "PostPmntWT", "QRCodeSPGn", "FCEPmnMean", "ReqCode", "NotRel4MI", "Rel4PPTax", "U_POSFCOffline", "U_POSHCOffline", "U_POSLIdOffline", "U_ClaveFE", "U_Provincia", "U_Canton", "U_Distrito", "U_Barrio", "U_Direccion", "U_CLVS_POS_UniqueInvId", "U_DocDateOffline", "U_DocTimeOffline", "U_Online", "U_User", "U_ListNum", "U_FeNumProvRef", "U_BatchId", "U_DocumentKey", "U_NumIdentFE", "U_TipoIdentificacion", "U_EMA_numTransaccion_acumular", "U_EMA_Approval_Status", "U_EMA_numTransaccion_redimir", "U_TipoDocE", "U_CorreoFE" ) AS SELECT "DocEntry" , "DocNum" , "DocType" , "CANCELED" , "Handwrtten" , "Printed" , "DocStatus" , "InvntSttus" , "Transfered" , "ObjType" , "DocDate" , "DocDueDate" , "CardCode" , "CardName" , "Address" , "NumAtCard" , "VatPercent" , "VatSum" , "VatSumFC" , "DiscPrcnt" , "DiscSum" , "DiscSumFC" , "DocCur" , "DocRate" , "DocTotal" , "DocTotalFC" , "PaidToDate" , "PaidFC" , "GrosProfit" , "GrosProfFC" , "Ref1" , "Ref2" , "Comments" , "JrnlMemo" , "TransId" , "ReceiptNum" , "GroupNum" , "DocTime" , "SlpCode" , "TrnspCode" , "PartSupply" , "Confirmed" , "GrossBase" , "ImportEnt" , "CreateTran" , "SummryType" , "UpdInvnt" , "UpdCardBal" , "Instance" , "Flags" , "InvntDirec" , "CntctCode" , "ShowSCN" , "FatherCard" , "SysRate" , "CurSource" , "VatSumSy" , "DiscSumSy" , "DocTotalSy" , "PaidSys" , "FatherType" , "GrosProfSy" , "UpdateDate" , "IsICT" , "CreateDate" , "Volume" , "VolUnit" , "Weight" , "WeightUnit" , "Series" , "TaxDate" , "Filler" , "DataSource" , "StampNum" , "isCrin" , "FinncPriod" , "UserSign" , "selfInv" , "VatPaid" , "VatPaidFC" , "VatPaidSys" , "UserSign2" , "WddStatus" , "draftKey" , "TotalExpns" , "TotalExpFC" , "TotalExpSC" , "DunnLevel" , "Address2" , "LogInstanc" , "Exported" , "StationID" , "Indicator" , "NetProc" , "AqcsTax" , "AqcsTaxFC" , "AqcsTaxSC" , "CashDiscPr" , "CashDiscnt" , "CashDiscFC" , "CashDiscSC" , "ShipToCode" , "LicTradNum" , "PaymentRef" , "WTSum" , "WTSumFC" , "WTSumSC" , "RoundDif" , "RoundDifFC" , "RoundDifSy" , "CheckDigit" , "Form1099" , "Box1099" , "submitted" , "PoPrss" , "Rounding" , "RevisionPo" , "Segment" , "ReqDate" , "CancelDate" , "PickStatus" , "Pick" , "BlockDunn" , "PeyMethod" , "PayBlock" , "PayBlckRef" , "MaxDscn" , "Reserve" , "Max1099" , "CntrlBnk" , "PickRmrk" , "ISRCodLine" , "ExpAppl" , "ExpApplFC" , "ExpApplSC" , "Project" , "DeferrTax" , "LetterNum" , "FromDate" , "ToDate" , "WTApplied" , "WTAppliedF" , "BoeReserev" , "AgentCode" , "WTAppliedS" , "EquVatSum" , "EquVatSumF" , "EquVatSumS" , "Installmnt" , "VATFirst" , "NnSbAmnt" , "NnSbAmntSC" , "NbSbAmntFC" , "ExepAmnt" , "ExepAmntSC" , "ExepAmntFC" , "VatDate" , "CorrExt" , "CorrInv" , "NCorrInv" , "CEECFlag" , "BaseAmnt" , "BaseAmntSC" , "BaseAmntFC" , "CtlAccount" , "BPLId" , "BPLName" , "VATRegNum" , "TxInvRptNo" , "TxInvRptDt" , "KVVATCode" , "WTDetails" , "SumAbsId" , "SumRptDate" , "PIndicator" , "ManualNum" , "UseShpdGd" , "BaseVtAt" , "BaseVtAtSC" , "BaseVtAtFC" , "NnSbVAt" , "NnSbVAtSC" , "NbSbVAtFC" , "ExptVAt" , "ExptVAtSC" , "ExptVAtFC" , "LYPmtAt" , "LYPmtAtSC" , "LYPmtAtFC" , "ExpAnSum" , "ExpAnSys" , "ExpAnFrgn" , "DocSubType" , "DpmStatus" , "DpmAmnt" , "DpmAmntSC" , "DpmAmntFC" , "DpmDrawn" , "DpmPrcnt" , "PaidSum" , "PaidSumFc" , "PaidSumSc" , "FolioPref" , "FolioNum" , "DpmAppl" , "DpmApplFc" , "DpmApplSc" , "LPgFolioN" , "Header" , "Footer" , "Posted" , "OwnerCode" , "BPChCode" , "BPChCntc" , "PayToCode" , "IsPaytoBnk" , "BnkCntry" , "BankCode" , "BnkAccount" , "BnkBranch" , "isIns" , "TrackNo" , "VersionNum" , "LangCode" , "BPNameOW" , "BillToOW" , "ShipToOW" , "RetInvoice" , "ClsDate" , "MInvNum" , "MInvDate" , "SeqCode" , "Serial" , "SeriesStr" , "SubStr" , "Model" , "TaxOnExp" , "TaxOnExpFc" , "TaxOnExpSc" , "TaxOnExAp" , "TaxOnExApF" , "TaxOnExApS" , "LastPmnTyp" , "LndCstNum" , "UseCorrVat" , "BlkCredMmo" , "OpenForLaC" , "Excised" , "ExcRefDate" , "ExcRmvTime" , "SrvGpPrcnt" , "DepositNum" , "CertNum" , "DutyStatus" , "AutoCrtFlw" , "FlwRefDate" , "FlwRefNum" , "VatJENum" , "DpmVat" , "DpmVatFc" , "DpmVatSc" , "DpmAppVat" , "DpmAppVatF" , "DpmAppVatS" , "InsurOp347" , "IgnRelDoc" , "BuildDesc" , "ResidenNum" , "Checker" , "Payee" , "CopyNumber" , "SSIExmpt" , "PQTGrpSer" , "PQTGrpNum" , "PQTGrpHW" , "ReopOriDoc" , "ReopManCls" , "DocManClsd" , "ClosingOpt" , "SpecDate" , "Ordered" , "NTSApprov" , "NTSWebSite" , "NTSeTaxNo" , "NTSApprNo" , "PayDuMonth" , "ExtraMonth" , "ExtraDays" , "CdcOffset" , "SignMsg" , "SignDigest" , "CertifNum" , "KeyVersion" , "EDocGenTyp" , "ESeries" , "EDocNum" , "EDocExpFrm" , "OnlineQuo" , "POSEqNum" , "POSManufSN" , "POSCashN" , "EDocStatus" , "EDocCntnt" , "EDocProces" , "EDocErrCod" , "EDocErrMsg" , "EDocCancel" , "EDocTest" , "EDocPrefix" , "CUP" , "CIG" , "DpmAsDscnt" , "Attachment" , "AtcEntry" , "SupplCode" , "GTSRlvnt" , "BaseDisc" , "BaseDiscSc" , "BaseDiscFc" , "BaseDiscPr" , "CreateTS" , "UpdateTS" , "SrvTaxRule" , "AnnInvDecR" , "Supplier" , "Releaser" , "Receiver" , "ToWhsCode" , "AssetDate" , "Requester" , "ReqName" , "Branch" , "Department" , "Email" , "Notify" , "ReqType" , "OriginType" , "IsReuseNum" , "IsReuseNFN" , "DocDlvry" , "PaidDpm" , "PaidDpmF" , "PaidDpmS" , "EnvTypeNFe" , "AgrNo" , "IsAlt" , "AltBaseTyp" , "AltBaseEnt" , "AuthCode" , "StDlvDate" , "StDlvTime" , "EndDlvDate" , "EndDlvTime" , "VclPlate" , "ElCoStatus" , "AtDocType" , "ElCoMsg" , "PrintSEPA" , "FreeChrg" , "FreeChrgFC" , "FreeChrgSC" , "NfeValue" , "FiscDocNum" , "RelatedTyp" , "RelatedEnt" , "CCDEntry" , "NfePrntFo" , "ZrdAbs" , "POSRcptNo" , "FoCTax" , "FoCTaxFC" , "FoCTaxSC" , "TpCusPres" , "ExcDocDate" , "FoCFrght" , "FoCFrghtFC" , "FoCFrghtSC" , "InterimTyp" , "PTICode" , "Letter" , "FolNumFrom" , "FolNumTo" , "FolSeries" , "SplitTax" , "SplitTaxFC" , "SplitTaxSC" , "ToBinCode" , "PriceMode" , "PoDropPrss" , "PermitNo" , "MYFtype" , "DocTaxID" , "DateReport" , "RepSection" , "ExclTaxRep" , "PosCashReg" , "DmpTransID" , "ECommerBP" , "EComerGSTN" , "Revision" , "RevRefNo" , "RevRefDate" , "RevCreRefN" , "RevCreRefD" , "TaxInvNo" , "FrmBpDate" , "GSTTranTyp" , "BaseType" , "BaseEntry" , "ComTrade" , "UseBilAddr" , "IssReason" , "ComTradeRt" , "SplitPmnt" , "SOIWizId" , "SelfPosted" , "EnBnkAcct" , "EncryptIV" , "DPPStatus" , "SAPPassprt" , "EWBGenType" , "CtActTax" , "CtActTaxFC" , "CtActTaxSC" , "EDocType" , "QRCodeSrc" , "AggregDoc" , "DataVers" , "ShipState" , "ShipPlace" , "CustOffice" , "FCI" , "NnSbCuAmnt" , "NnSbCuSC" , "NnSbCuFC" , "ExepCuAmnt" , "ExepCuSC" , "ExepCuFC" , "AddLegIn" , "LegTextF" , "IndFinal" , "DANFELgTxt" , "PostPmntWT" , "QRCodeSPGn" , "FCEPmnMean" , "ReqCode" , "NotRel4MI" , "Rel4PPTax" , "U_POSFCOffline" , "U_POSHCOffline" , "U_POSLIdOffline" , "U_ClaveFE" , "U_Provincia" , "U_Canton" , "U_Distrito" , "U_Barrio" , "U_Direccion" , "U_CLVS_POS_UniqueInvId" , "U_DocDateOffline" , "U_DocTimeOffline" , "U_Online" , "U_User" , "U_ListNum" , "U_FeNumProvRef" , "U_BatchId" , "U_DocumentKey" , "U_NumIdentFE" , "U_TipoIdentificacion" , "U_EMA_numTransaccion_acumular" , "U_EMA_Approval_Status" , "U_EMA_numTransaccion_redimir" , "U_TipoDocE" , "U_CorreoFE" FROM OPCH;



--180-----------------------------------------------------------180--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_UDF_OPDN_B1SLQuery" ( "DocEntry", "DocNum", "DocType", "CANCELED", "Handwrtten", "Printed", "DocStatus", "InvntSttus", "Transfered", "ObjType", "DocDate", "DocDueDate", "CardCode", "CardName", "Address", "NumAtCard", "VatPercent", "VatSum", "VatSumFC", "DiscPrcnt", "DiscSum", "DiscSumFC", "DocCur", "DocRate", "DocTotal", "DocTotalFC", "PaidToDate", "PaidFC", "GrosProfit", "GrosProfFC", "Ref1", "Ref2", "Comments", "JrnlMemo", "TransId", "ReceiptNum", "GroupNum", "DocTime", "SlpCode", "TrnspCode", "PartSupply", "Confirmed", "GrossBase", "ImportEnt", "CreateTran", "SummryType", "UpdInvnt", "UpdCardBal", "Instance", "Flags", "InvntDirec", "CntctCode", "ShowSCN", "FatherCard", "SysRate", "CurSource", "VatSumSy", "DiscSumSy", "DocTotalSy", "PaidSys", "FatherType", "GrosProfSy", "UpdateDate", "IsICT", "CreateDate", "Volume", "VolUnit", "Weight", "WeightUnit", "Series", "TaxDate", "Filler", "DataSource", "StampNum", "isCrin", "FinncPriod", "UserSign", "selfInv", "VatPaid", "VatPaidFC", "VatPaidSys", "UserSign2", "WddStatus", "draftKey", "TotalExpns", "TotalExpFC", "TotalExpSC", "DunnLevel", "Address2", "LogInstanc", "Exported", "StationID", "Indicator", "NetProc", "AqcsTax", "AqcsTaxFC", "AqcsTaxSC", "CashDiscPr", "CashDiscnt", "CashDiscFC", "CashDiscSC", "ShipToCode", "LicTradNum", "PaymentRef", "WTSum", "WTSumFC", "WTSumSC", "RoundDif", "RoundDifFC", "RoundDifSy", "CheckDigit", "Form1099", "Box1099", "submitted", "PoPrss", "Rounding", "RevisionPo", "Segment", "ReqDate", "CancelDate", "PickStatus", "Pick", "BlockDunn", "PeyMethod", "PayBlock", "PayBlckRef", "MaxDscn", "Reserve", "Max1099", "CntrlBnk", "PickRmrk", "ISRCodLine", "ExpAppl", "ExpApplFC", "ExpApplSC", "Project", "DeferrTax", "LetterNum", "FromDate", "ToDate", "WTApplied", "WTAppliedF", "BoeReserev", "AgentCode", "WTAppliedS", "EquVatSum", "EquVatSumF", "EquVatSumS", "Installmnt", "VATFirst", "NnSbAmnt", "NnSbAmntSC", "NbSbAmntFC", "ExepAmnt", "ExepAmntSC", "ExepAmntFC", "VatDate", "CorrExt", "CorrInv", "NCorrInv", "CEECFlag", "BaseAmnt", "BaseAmntSC", "BaseAmntFC", "CtlAccount", "BPLId", "BPLName", "VATRegNum", "TxInvRptNo", "TxInvRptDt", "KVVATCode", "WTDetails", "SumAbsId", "SumRptDate", "PIndicator", "ManualNum", "UseShpdGd", "BaseVtAt", "BaseVtAtSC", "BaseVtAtFC", "NnSbVAt", "NnSbVAtSC", "NbSbVAtFC", "ExptVAt", "ExptVAtSC", "ExptVAtFC", "LYPmtAt", "LYPmtAtSC", "LYPmtAtFC", "ExpAnSum", "ExpAnSys", "ExpAnFrgn", "DocSubType", "DpmStatus", "DpmAmnt", "DpmAmntSC", "DpmAmntFC", "DpmDrawn", "DpmPrcnt", "PaidSum", "PaidSumFc", "PaidSumSc", "FolioPref", "FolioNum", "DpmAppl", "DpmApplFc", "DpmApplSc", "LPgFolioN", "Header", "Footer", "Posted", "OwnerCode", "BPChCode", "BPChCntc", "PayToCode", "IsPaytoBnk", "BnkCntry", "BankCode", "BnkAccount", "BnkBranch", "isIns", "TrackNo", "VersionNum", "LangCode", "BPNameOW", "BillToOW", "ShipToOW", "RetInvoice", "ClsDate", "MInvNum", "MInvDate", "SeqCode", "Serial", "SeriesStr", "SubStr", "Model", "TaxOnExp", "TaxOnExpFc", "TaxOnExpSc", "TaxOnExAp", "TaxOnExApF", "TaxOnExApS", "LastPmnTyp", "LndCstNum", "UseCorrVat", "BlkCredMmo", "OpenForLaC", "Excised", "ExcRefDate", "ExcRmvTime", "SrvGpPrcnt", "DepositNum", "CertNum", "DutyStatus", "AutoCrtFlw", "FlwRefDate", "FlwRefNum", "VatJENum", "DpmVat", "DpmVatFc", "DpmVatSc", "DpmAppVat", "DpmAppVatF", "DpmAppVatS", "InsurOp347", "IgnRelDoc", "BuildDesc", "ResidenNum", "Checker", "Payee", "CopyNumber", "SSIExmpt", "PQTGrpSer", "PQTGrpNum", "PQTGrpHW", "ReopOriDoc", "ReopManCls", "DocManClsd", "ClosingOpt", "SpecDate", "Ordered", "NTSApprov", "NTSWebSite", "NTSeTaxNo", "NTSApprNo", "PayDuMonth", "ExtraMonth", "ExtraDays", "CdcOffset", "SignMsg", "SignDigest", "CertifNum", "KeyVersion", "EDocGenTyp", "ESeries", "EDocNum", "EDocExpFrm", "OnlineQuo", "POSEqNum", "POSManufSN", "POSCashN", "EDocStatus", "EDocCntnt", "EDocProces", "EDocErrCod", "EDocErrMsg", "EDocCancel", "EDocTest", "EDocPrefix", "CUP", "CIG", "DpmAsDscnt", "Attachment", "AtcEntry", "SupplCode", "GTSRlvnt", "BaseDisc", "BaseDiscSc", "BaseDiscFc", "BaseDiscPr", "CreateTS", "UpdateTS", "SrvTaxRule", "AnnInvDecR", "Supplier", "Releaser", "Receiver", "ToWhsCode", "AssetDate", "Requester", "ReqName", "Branch", "Department", "Email", "Notify", "ReqType", "OriginType", "IsReuseNum", "IsReuseNFN", "DocDlvry", "PaidDpm", "PaidDpmF", "PaidDpmS", "EnvTypeNFe", "AgrNo", "IsAlt", "AltBaseTyp", "AltBaseEnt", "AuthCode", "StDlvDate", "StDlvTime", "EndDlvDate", "EndDlvTime", "VclPlate", "ElCoStatus", "AtDocType", "ElCoMsg", "PrintSEPA", "FreeChrg", "FreeChrgFC", "FreeChrgSC", "NfeValue", "FiscDocNum", "RelatedTyp", "RelatedEnt", "CCDEntry", "NfePrntFo", "ZrdAbs", "POSRcptNo", "FoCTax", "FoCTaxFC", "FoCTaxSC", "TpCusPres", "ExcDocDate", "FoCFrght", "FoCFrghtFC", "FoCFrghtSC", "InterimTyp", "PTICode", "Letter", "FolNumFrom", "FolNumTo", "FolSeries", "SplitTax", "SplitTaxFC", "SplitTaxSC", "ToBinCode", "PriceMode", "PoDropPrss", "PermitNo", "MYFtype", "DocTaxID", "DateReport", "RepSection", "ExclTaxRep", "PosCashReg", "DmpTransID", "ECommerBP", "EComerGSTN", "Revision", "RevRefNo", "RevRefDate", "RevCreRefN", "RevCreRefD", "TaxInvNo", "FrmBpDate", "GSTTranTyp", "BaseType", "BaseEntry", "ComTrade", "UseBilAddr", "IssReason", "ComTradeRt", "SplitPmnt", "SOIWizId", "SelfPosted", "EnBnkAcct", "EncryptIV", "DPPStatus", "SAPPassprt", "EWBGenType", "CtActTax", "CtActTaxFC", "CtActTaxSC", "EDocType", "QRCodeSrc", "AggregDoc", "DataVers", "ShipState", "ShipPlace", "CustOffice", "FCI", "NnSbCuAmnt", "NnSbCuSC", "NnSbCuFC", "ExepCuAmnt", "ExepCuSC", "ExepCuFC", "AddLegIn", "LegTextF", "IndFinal", "DANFELgTxt", "PostPmntWT", "QRCodeSPGn", "FCEPmnMean", "ReqCode", "NotRel4MI", "Rel4PPTax", "U_POSFCOffline", "U_POSHCOffline", "U_POSLIdOffline", "U_ClaveFE", "U_Provincia", "U_Canton", "U_Distrito", "U_Barrio", "U_Direccion", "U_CLVS_POS_UniqueInvId", "U_DocDateOffline", "U_DocTimeOffline", "U_Online", "U_User", "U_ListNum", "U_FeNumProvRef", "U_BatchId", "U_DocumentKey", "U_NumIdentFE", "U_TipoIdentificacion", "U_EMA_numTransaccion_acumular", "U_EMA_Approval_Status", "U_EMA_numTransaccion_redimir", "U_TipoDocE", "U_CorreoFE" ) AS SELECT "DocEntry" , "DocNum" , "DocType" , "CANCELED" , "Handwrtten" , "Printed" , "DocStatus" , "InvntSttus" , "Transfered" , "ObjType" , "DocDate" , "DocDueDate" , "CardCode" , "CardName" , "Address" , "NumAtCard" , "VatPercent" , "VatSum" , "VatSumFC" , "DiscPrcnt" , "DiscSum" , "DiscSumFC" , "DocCur" , "DocRate" , "DocTotal" , "DocTotalFC" , "PaidToDate" , "PaidFC" , "GrosProfit" , "GrosProfFC" , "Ref1" , "Ref2" , "Comments" , "JrnlMemo" , "TransId" , "ReceiptNum" , "GroupNum" , "DocTime" , "SlpCode" , "TrnspCode" , "PartSupply" , "Confirmed" , "GrossBase" , "ImportEnt" , "CreateTran" , "SummryType" , "UpdInvnt" , "UpdCardBal" , "Instance" , "Flags" , "InvntDirec" , "CntctCode" , "ShowSCN" , "FatherCard" , "SysRate" , "CurSource" , "VatSumSy" , "DiscSumSy" , "DocTotalSy" , "PaidSys" , "FatherType" , "GrosProfSy" , "UpdateDate" , "IsICT" , "CreateDate" , "Volume" , "VolUnit" , "Weight" , "WeightUnit" , "Series" , "TaxDate" , "Filler" , "DataSource" , "StampNum" , "isCrin" , "FinncPriod" , "UserSign" , "selfInv" , "VatPaid" , "VatPaidFC" , "VatPaidSys" , "UserSign2" , "WddStatus" , "draftKey" , "TotalExpns" , "TotalExpFC" , "TotalExpSC" , "DunnLevel" , "Address2" , "LogInstanc" , "Exported" , "StationID" , "Indicator" , "NetProc" , "AqcsTax" , "AqcsTaxFC" , "AqcsTaxSC" , "CashDiscPr" , "CashDiscnt" , "CashDiscFC" , "CashDiscSC" , "ShipToCode" , "LicTradNum" , "PaymentRef" , "WTSum" , "WTSumFC" , "WTSumSC" , "RoundDif" , "RoundDifFC" , "RoundDifSy" , "CheckDigit" , "Form1099" , "Box1099" , "submitted" , "PoPrss" , "Rounding" , "RevisionPo" , "Segment" , "ReqDate" , "CancelDate" , "PickStatus" , "Pick" , "BlockDunn" , "PeyMethod" , "PayBlock" , "PayBlckRef" , "MaxDscn" , "Reserve" , "Max1099" , "CntrlBnk" , "PickRmrk" , "ISRCodLine" , "ExpAppl" , "ExpApplFC" , "ExpApplSC" , "Project" , "DeferrTax" , "LetterNum" , "FromDate" , "ToDate" , "WTApplied" , "WTAppliedF" , "BoeReserev" , "AgentCode" , "WTAppliedS" , "EquVatSum" , "EquVatSumF" , "EquVatSumS" , "Installmnt" , "VATFirst" , "NnSbAmnt" , "NnSbAmntSC" , "NbSbAmntFC" , "ExepAmnt" , "ExepAmntSC" , "ExepAmntFC" , "VatDate" , "CorrExt" , "CorrInv" , "NCorrInv" , "CEECFlag" , "BaseAmnt" , "BaseAmntSC" , "BaseAmntFC" , "CtlAccount" , "BPLId" , "BPLName" , "VATRegNum" , "TxInvRptNo" , "TxInvRptDt" , "KVVATCode" , "WTDetails" , "SumAbsId" , "SumRptDate" , "PIndicator" , "ManualNum" , "UseShpdGd" , "BaseVtAt" , "BaseVtAtSC" , "BaseVtAtFC" , "NnSbVAt" , "NnSbVAtSC" , "NbSbVAtFC" , "ExptVAt" , "ExptVAtSC" , "ExptVAtFC" , "LYPmtAt" , "LYPmtAtSC" , "LYPmtAtFC" , "ExpAnSum" , "ExpAnSys" , "ExpAnFrgn" , "DocSubType" , "DpmStatus" , "DpmAmnt" , "DpmAmntSC" , "DpmAmntFC" , "DpmDrawn" , "DpmPrcnt" , "PaidSum" , "PaidSumFc" , "PaidSumSc" , "FolioPref" , "FolioNum" , "DpmAppl" , "DpmApplFc" , "DpmApplSc" , "LPgFolioN" , "Header" , "Footer" , "Posted" , "OwnerCode" , "BPChCode" , "BPChCntc" , "PayToCode" , "IsPaytoBnk" , "BnkCntry" , "BankCode" , "BnkAccount" , "BnkBranch" , "isIns" , "TrackNo" , "VersionNum" , "LangCode" , "BPNameOW" , "BillToOW" , "ShipToOW" , "RetInvoice" , "ClsDate" , "MInvNum" , "MInvDate" , "SeqCode" , "Serial" , "SeriesStr" , "SubStr" , "Model" , "TaxOnExp" , "TaxOnExpFc" , "TaxOnExpSc" , "TaxOnExAp" , "TaxOnExApF" , "TaxOnExApS" , "LastPmnTyp" , "LndCstNum" , "UseCorrVat" , "BlkCredMmo" , "OpenForLaC" , "Excised" , "ExcRefDate" , "ExcRmvTime" , "SrvGpPrcnt" , "DepositNum" , "CertNum" , "DutyStatus" , "AutoCrtFlw" , "FlwRefDate" , "FlwRefNum" , "VatJENum" , "DpmVat" , "DpmVatFc" , "DpmVatSc" , "DpmAppVat" , "DpmAppVatF" , "DpmAppVatS" , "InsurOp347" , "IgnRelDoc" , "BuildDesc" , "ResidenNum" , "Checker" , "Payee" , "CopyNumber" , "SSIExmpt" , "PQTGrpSer" , "PQTGrpNum" , "PQTGrpHW" , "ReopOriDoc" , "ReopManCls" , "DocManClsd" , "ClosingOpt" , "SpecDate" , "Ordered" , "NTSApprov" , "NTSWebSite" , "NTSeTaxNo" , "NTSApprNo" , "PayDuMonth" , "ExtraMonth" , "ExtraDays" , "CdcOffset" , "SignMsg" , "SignDigest" , "CertifNum" , "KeyVersion" , "EDocGenTyp" , "ESeries" , "EDocNum" , "EDocExpFrm" , "OnlineQuo" , "POSEqNum" , "POSManufSN" , "POSCashN" , "EDocStatus" , "EDocCntnt" , "EDocProces" , "EDocErrCod" , "EDocErrMsg" , "EDocCancel" , "EDocTest" , "EDocPrefix" , "CUP" , "CIG" , "DpmAsDscnt" , "Attachment" , "AtcEntry" , "SupplCode" , "GTSRlvnt" , "BaseDisc" , "BaseDiscSc" , "BaseDiscFc" , "BaseDiscPr" , "CreateTS" , "UpdateTS" , "SrvTaxRule" , "AnnInvDecR" , "Supplier" , "Releaser" , "Receiver" , "ToWhsCode" , "AssetDate" , "Requester" , "ReqName" , "Branch" , "Department" , "Email" , "Notify" , "ReqType" , "OriginType" , "IsReuseNum" , "IsReuseNFN" , "DocDlvry" , "PaidDpm" , "PaidDpmF" , "PaidDpmS" , "EnvTypeNFe" , "AgrNo" , "IsAlt" , "AltBaseTyp" , "AltBaseEnt" , "AuthCode" , "StDlvDate" , "StDlvTime" , "EndDlvDate" , "EndDlvTime" , "VclPlate" , "ElCoStatus" , "AtDocType" , "ElCoMsg" , "PrintSEPA" , "FreeChrg" , "FreeChrgFC" , "FreeChrgSC" , "NfeValue" , "FiscDocNum" , "RelatedTyp" , "RelatedEnt" , "CCDEntry" , "NfePrntFo" , "ZrdAbs" , "POSRcptNo" , "FoCTax" , "FoCTaxFC" , "FoCTaxSC" , "TpCusPres" , "ExcDocDate" , "FoCFrght" , "FoCFrghtFC" , "FoCFrghtSC" , "InterimTyp" , "PTICode" , "Letter" , "FolNumFrom" , "FolNumTo" , "FolSeries" , "SplitTax" , "SplitTaxFC" , "SplitTaxSC" , "ToBinCode" , "PriceMode" , "PoDropPrss" , "PermitNo" , "MYFtype" , "DocTaxID" , "DateReport" , "RepSection" , "ExclTaxRep" , "PosCashReg" , "DmpTransID" , "ECommerBP" , "EComerGSTN" , "Revision" , "RevRefNo" , "RevRefDate" , "RevCreRefN" , "RevCreRefD" , "TaxInvNo" , "FrmBpDate" , "GSTTranTyp" , "BaseType" , "BaseEntry" , "ComTrade" , "UseBilAddr" , "IssReason" , "ComTradeRt" , "SplitPmnt" , "SOIWizId" , "SelfPosted" , "EnBnkAcct" , "EncryptIV" , "DPPStatus" , "SAPPassprt" , "EWBGenType" , "CtActTax" , "CtActTaxFC" , "CtActTaxSC" , "EDocType" , "QRCodeSrc" , "AggregDoc" , "DataVers" , "ShipState" , "ShipPlace" , "CustOffice" , "FCI" , "NnSbCuAmnt" , "NnSbCuSC" , "NnSbCuFC" , "ExepCuAmnt" , "ExepCuSC" , "ExepCuFC" , "AddLegIn" , "LegTextF" , "IndFinal" , "DANFELgTxt" , "PostPmntWT" , "QRCodeSPGn" , "FCEPmnMean" , "ReqCode" , "NotRel4MI" , "Rel4PPTax" , "U_POSFCOffline" , "U_POSHCOffline" , "U_POSLIdOffline" , "U_ClaveFE" , "U_Provincia" , "U_Canton" , "U_Distrito" , "U_Barrio" , "U_Direccion" , "U_CLVS_POS_UniqueInvId" , "U_DocDateOffline" , "U_DocTimeOffline" , "U_Online" , "U_User" , "U_ListNum" , "U_FeNumProvRef" , "U_BatchId" , "U_DocumentKey" , "U_NumIdentFE" , "U_TipoIdentificacion" , "U_EMA_numTransaccion_acumular" , "U_EMA_Approval_Status" , "U_EMA_numTransaccion_redimir" , "U_TipoDocE" , "U_CorreoFE" FROM OPDN;



--181-----------------------------------------------------------181--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_UDF_OPOR_B1SLQuery" ( "DocEntry", "DocNum", "DocType", "CANCELED", "Handwrtten", "Printed", "DocStatus", "InvntSttus", "Transfered", "ObjType", "DocDate", "DocDueDate", "CardCode", "CardName", "Address", "NumAtCard", "VatPercent", "VatSum", "VatSumFC", "DiscPrcnt", "DiscSum", "DiscSumFC", "DocCur", "DocRate", "DocTotal", "DocTotalFC", "PaidToDate", "PaidFC", "GrosProfit", "GrosProfFC", "Ref1", "Ref2", "Comments", "JrnlMemo", "TransId", "ReceiptNum", "GroupNum", "DocTime", "SlpCode", "TrnspCode", "PartSupply", "Confirmed", "GrossBase", "ImportEnt", "CreateTran", "SummryType", "UpdInvnt", "UpdCardBal", "Instance", "Flags", "InvntDirec", "CntctCode", "ShowSCN", "FatherCard", "SysRate", "CurSource", "VatSumSy", "DiscSumSy", "DocTotalSy", "PaidSys", "FatherType", "GrosProfSy", "UpdateDate", "IsICT", "CreateDate", "Volume", "VolUnit", "Weight", "WeightUnit", "Series", "TaxDate", "Filler", "DataSource", "StampNum", "isCrin", "FinncPriod", "UserSign", "selfInv", "VatPaid", "VatPaidFC", "VatPaidSys", "UserSign2", "WddStatus", "draftKey", "TotalExpns", "TotalExpFC", "TotalExpSC", "DunnLevel", "Address2", "LogInstanc", "Exported", "StationID", "Indicator", "NetProc", "AqcsTax", "AqcsTaxFC", "AqcsTaxSC", "CashDiscPr", "CashDiscnt", "CashDiscFC", "CashDiscSC", "ShipToCode", "LicTradNum", "PaymentRef", "WTSum", "WTSumFC", "WTSumSC", "RoundDif", "RoundDifFC", "RoundDifSy", "CheckDigit", "Form1099", "Box1099", "submitted", "PoPrss", "Rounding", "RevisionPo", "Segment", "ReqDate", "CancelDate", "PickStatus", "Pick", "BlockDunn", "PeyMethod", "PayBlock", "PayBlckRef", "MaxDscn", "Reserve", "Max1099", "CntrlBnk", "PickRmrk", "ISRCodLine", "ExpAppl", "ExpApplFC", "ExpApplSC", "Project", "DeferrTax", "LetterNum", "FromDate", "ToDate", "WTApplied", "WTAppliedF", "BoeReserev", "AgentCode", "WTAppliedS", "EquVatSum", "EquVatSumF", "EquVatSumS", "Installmnt", "VATFirst", "NnSbAmnt", "NnSbAmntSC", "NbSbAmntFC", "ExepAmnt", "ExepAmntSC", "ExepAmntFC", "VatDate", "CorrExt", "CorrInv", "NCorrInv", "CEECFlag", "BaseAmnt", "BaseAmntSC", "BaseAmntFC", "CtlAccount", "BPLId", "BPLName", "VATRegNum", "TxInvRptNo", "TxInvRptDt", "KVVATCode", "WTDetails", "SumAbsId", "SumRptDate", "PIndicator", "ManualNum", "UseShpdGd", "BaseVtAt", "BaseVtAtSC", "BaseVtAtFC", "NnSbVAt", "NnSbVAtSC", "NbSbVAtFC", "ExptVAt", "ExptVAtSC", "ExptVAtFC", "LYPmtAt", "LYPmtAtSC", "LYPmtAtFC", "ExpAnSum", "ExpAnSys", "ExpAnFrgn", "DocSubType", "DpmStatus", "DpmAmnt", "DpmAmntSC", "DpmAmntFC", "DpmDrawn", "DpmPrcnt", "PaidSum", "PaidSumFc", "PaidSumSc", "FolioPref", "FolioNum", "DpmAppl", "DpmApplFc", "DpmApplSc", "LPgFolioN", "Header", "Footer", "Posted", "OwnerCode", "BPChCode", "BPChCntc", "PayToCode", "IsPaytoBnk", "BnkCntry", "BankCode", "BnkAccount", "BnkBranch", "isIns", "TrackNo", "VersionNum", "LangCode", "BPNameOW", "BillToOW", "ShipToOW", "RetInvoice", "ClsDate", "MInvNum", "MInvDate", "SeqCode", "Serial", "SeriesStr", "SubStr", "Model", "TaxOnExp", "TaxOnExpFc", "TaxOnExpSc", "TaxOnExAp", "TaxOnExApF", "TaxOnExApS", "LastPmnTyp", "LndCstNum", "UseCorrVat", "BlkCredMmo", "OpenForLaC", "Excised", "ExcRefDate", "ExcRmvTime", "SrvGpPrcnt", "DepositNum", "CertNum", "DutyStatus", "AutoCrtFlw", "FlwRefDate", "FlwRefNum", "VatJENum", "DpmVat", "DpmVatFc", "DpmVatSc", "DpmAppVat", "DpmAppVatF", "DpmAppVatS", "InsurOp347", "IgnRelDoc", "BuildDesc", "ResidenNum", "Checker", "Payee", "CopyNumber", "SSIExmpt", "PQTGrpSer", "PQTGrpNum", "PQTGrpHW", "ReopOriDoc", "ReopManCls", "DocManClsd", "ClosingOpt", "SpecDate", "Ordered", "NTSApprov", "NTSWebSite", "NTSeTaxNo", "NTSApprNo", "PayDuMonth", "ExtraMonth", "ExtraDays", "CdcOffset", "SignMsg", "SignDigest", "CertifNum", "KeyVersion", "EDocGenTyp", "ESeries", "EDocNum", "EDocExpFrm", "OnlineQuo", "POSEqNum", "POSManufSN", "POSCashN", "EDocStatus", "EDocCntnt", "EDocProces", "EDocErrCod", "EDocErrMsg", "EDocCancel", "EDocTest", "EDocPrefix", "CUP", "CIG", "DpmAsDscnt", "Attachment", "AtcEntry", "SupplCode", "GTSRlvnt", "BaseDisc", "BaseDiscSc", "BaseDiscFc", "BaseDiscPr", "CreateTS", "UpdateTS", "SrvTaxRule", "AnnInvDecR", "Supplier", "Releaser", "Receiver", "ToWhsCode", "AssetDate", "Requester", "ReqName", "Branch", "Department", "Email", "Notify", "ReqType", "OriginType", "IsReuseNum", "IsReuseNFN", "DocDlvry", "PaidDpm", "PaidDpmF", "PaidDpmS", "EnvTypeNFe", "AgrNo", "IsAlt", "AltBaseTyp", "AltBaseEnt", "AuthCode", "StDlvDate", "StDlvTime", "EndDlvDate", "EndDlvTime", "VclPlate", "ElCoStatus", "AtDocType", "ElCoMsg", "PrintSEPA", "FreeChrg", "FreeChrgFC", "FreeChrgSC", "NfeValue", "FiscDocNum", "RelatedTyp", "RelatedEnt", "CCDEntry", "NfePrntFo", "ZrdAbs", "POSRcptNo", "FoCTax", "FoCTaxFC", "FoCTaxSC", "TpCusPres", "ExcDocDate", "FoCFrght", "FoCFrghtFC", "FoCFrghtSC", "InterimTyp", "PTICode", "Letter", "FolNumFrom", "FolNumTo", "FolSeries", "SplitTax", "SplitTaxFC", "SplitTaxSC", "ToBinCode", "PriceMode", "PoDropPrss", "PermitNo", "MYFtype", "DocTaxID", "DateReport", "RepSection", "ExclTaxRep", "PosCashReg", "DmpTransID", "ECommerBP", "EComerGSTN", "Revision", "RevRefNo", "RevRefDate", "RevCreRefN", "RevCreRefD", "TaxInvNo", "FrmBpDate", "GSTTranTyp", "BaseType", "BaseEntry", "ComTrade", "UseBilAddr", "IssReason", "ComTradeRt", "SplitPmnt", "SOIWizId", "SelfPosted", "EnBnkAcct", "EncryptIV", "DPPStatus", "SAPPassprt", "EWBGenType", "CtActTax", "CtActTaxFC", "CtActTaxSC", "EDocType", "QRCodeSrc", "AggregDoc", "DataVers", "ShipState", "ShipPlace", "CustOffice", "FCI", "NnSbCuAmnt", "NnSbCuSC", "NnSbCuFC", "ExepCuAmnt", "ExepCuSC", "ExepCuFC", "AddLegIn", "LegTextF", "IndFinal", "DANFELgTxt", "PostPmntWT", "QRCodeSPGn", "FCEPmnMean", "ReqCode", "NotRel4MI", "Rel4PPTax", "U_POSFCOffline", "U_POSHCOffline", "U_POSLIdOffline", "U_ClaveFE", "U_Provincia", "U_Canton", "U_Distrito", "U_Barrio", "U_Direccion", "U_CLVS_POS_UniqueInvId", "U_DocDateOffline", "U_DocTimeOffline", "U_Online", "U_User", "U_ListNum", "U_FeNumProvRef", "U_BatchId", "U_DocumentKey", "U_NumIdentFE", "U_TipoIdentificacion", "U_EMA_numTransaccion_acumular", "U_EMA_Approval_Status", "U_EMA_numTransaccion_redimir", "U_TipoDocE", "U_CorreoFE" ) AS SELECT "ORD"."DocEntry" , "ORD"."DocNum" , "ORD"."DocType" , "ORD"."CANCELED" , "ORD"."Handwrtten" , "ORD"."Printed" , "ORD"."DocStatus" , "ORD"."InvntSttus" , "ORD"."Transfered" , "ORD"."ObjType" , "ORD"."DocDate" , "ORD"."DocDueDate" , "ORD"."CardCode" , "ORD"."CardName" , "ORD"."Address" , "ORD"."NumAtCard" , "ORD"."VatPercent" , "ORD"."VatSum" , "ORD"."VatSumFC" , "ORD"."DiscPrcnt" , "ORD"."DiscSum" , "ORD"."DiscSumFC" , "ORD"."DocCur" , "ORD"."DocRate" , "ORD"."DocTotal" , "ORD"."DocTotalFC" , "ORD"."PaidToDate" , "ORD"."PaidFC" , "ORD"."GrosProfit" , "ORD"."GrosProfFC" , "ORD"."Ref1" , "ORD"."Ref2" , "ORD"."Comments" , "ORD"."JrnlMemo" , "ORD"."TransId" , "ORD"."ReceiptNum" , "ORD"."GroupNum" , "ORD"."DocTime" , "ORD"."SlpCode" , "ORD"."TrnspCode" , "ORD"."PartSupply" , "ORD"."Confirmed" , "ORD"."GrossBase" , "ORD"."ImportEnt" , "ORD"."CreateTran" , "ORD"."SummryType" , "ORD"."UpdInvnt" , "ORD"."UpdCardBal" , "ORD"."Instance" , "ORD"."Flags" , "ORD"."InvntDirec" , "ORD"."CntctCode" , "ORD"."ShowSCN" , "ORD"."FatherCard" , "ORD"."SysRate" , "ORD"."CurSource" , "ORD"."VatSumSy" , "ORD"."DiscSumSy" , "ORD"."DocTotalSy" , "ORD"."PaidSys" , "ORD"."FatherType" , "ORD"."GrosProfSy" , "ORD"."UpdateDate" , "ORD"."IsICT" , "ORD"."CreateDate" , "ORD"."Volume" , "ORD"."VolUnit" , "ORD"."Weight" , "ORD"."WeightUnit" , "ORD"."Series" , "ORD"."TaxDate" , "ORD"."Filler" , "ORD"."DataSource" , "ORD"."StampNum" , "ORD"."isCrin" , "ORD"."FinncPriod" , "ORD"."UserSign" , "ORD"."selfInv" , "ORD"."VatPaid" , "ORD"."VatPaidFC" , "ORD"."VatPaidSys" , "ORD"."UserSign2" , "ORD"."WddStatus" , "ORD"."draftKey" , "ORD"."TotalExpns" , "ORD"."TotalExpFC" , "ORD"."TotalExpSC" , "ORD"."DunnLevel" , "ORD"."Address2" , "ORD"."LogInstanc" , "ORD"."Exported" , "ORD"."StationID" , "ORD"."Indicator" , "ORD"."NetProc" , "ORD"."AqcsTax" , "ORD"."AqcsTaxFC" , "ORD"."AqcsTaxSC" , "ORD"."CashDiscPr" , "ORD"."CashDiscnt" , "ORD"."CashDiscFC" , "ORD"."CashDiscSC" , "ORD"."ShipToCode" , "ORD"."LicTradNum" , "ORD"."PaymentRef" , "ORD"."WTSum" , "ORD"."WTSumFC" , "ORD"."WTSumSC" , "ORD"."RoundDif" , "ORD"."RoundDifFC" , "ORD"."RoundDifSy" , "ORD"."CheckDigit" , "ORD"."Form1099" , "ORD"."Box1099" , "ORD"."submitted" , "ORD"."PoPrss" , "ORD"."Rounding" , "ORD"."RevisionPo" , "ORD"."Segment" , "ORD"."ReqDate" , "ORD"."CancelDate" , "ORD"."PickStatus" , "ORD"."Pick" , "ORD"."BlockDunn" , "ORD"."PeyMethod" , "ORD"."PayBlock" , "ORD"."PayBlckRef" , "ORD"."MaxDscn" , "ORD"."Reserve" , "ORD"."Max1099" , "ORD"."CntrlBnk" , "ORD"."PickRmrk" , "ORD"."ISRCodLine" , "ORD"."ExpAppl" , "ORD"."ExpApplFC" , "ORD"."ExpApplSC" , "ORD"."Project" , "ORD"."DeferrTax" , "ORD"."LetterNum" , "ORD"."FromDate" , "ORD"."ToDate" , "ORD"."WTApplied" , "ORD"."WTAppliedF" , "ORD"."BoeReserev" , "ORD"."AgentCode" , "ORD"."WTAppliedS" , "ORD"."EquVatSum" , "ORD"."EquVatSumF" , "ORD"."EquVatSumS" , "ORD"."Installmnt" , "ORD"."VATFirst" , "ORD"."NnSbAmnt" , "ORD"."NnSbAmntSC" , "ORD"."NbSbAmntFC" , "ORD"."ExepAmnt" , "ORD"."ExepAmntSC" , "ORD"."ExepAmntFC" , "ORD"."VatDate" , "ORD"."CorrExt" , "ORD"."CorrInv" , "ORD"."NCorrInv" , "ORD"."CEECFlag" , "ORD"."BaseAmnt" , "ORD"."BaseAmntSC" , "ORD"."BaseAmntFC" , "ORD"."CtlAccount" , "ORD"."BPLId" , "ORD"."BPLName" , "ORD"."VATRegNum" , "ORD"."TxInvRptNo" , "ORD"."TxInvRptDt" , "ORD"."KVVATCode" , "ORD"."WTDetails" , "ORD"."SumAbsId" , "ORD"."SumRptDate" , "ORD"."PIndicator" , "ORD"."ManualNum" , "ORD"."UseShpdGd" , "ORD"."BaseVtAt" , "ORD"."BaseVtAtSC" , "ORD"."BaseVtAtFC" , "ORD"."NnSbVAt" , "ORD"."NnSbVAtSC" , "ORD"."NbSbVAtFC" , "ORD"."ExptVAt" , "ORD"."ExptVAtSC" , "ORD"."ExptVAtFC" , "ORD"."LYPmtAt" , "ORD"."LYPmtAtSC" , "ORD"."LYPmtAtFC" , "ORD"."ExpAnSum" , "ORD"."ExpAnSys" , "ORD"."ExpAnFrgn" , "ORD"."DocSubType" , "ORD"."DpmStatus" , "ORD"."DpmAmnt" , "ORD"."DpmAmntSC" , "ORD"."DpmAmntFC" , "ORD"."DpmDrawn" , "ORD"."DpmPrcnt" , "ORD"."PaidSum" , "ORD"."PaidSumFc" , "ORD"."PaidSumSc" , "ORD"."FolioPref" , "ORD"."FolioNum" , "ORD"."DpmAppl" , "ORD"."DpmApplFc" , "ORD"."DpmApplSc" , "ORD"."LPgFolioN" , "ORD"."Header" , "ORD"."Footer" , "ORD"."Posted" , "ORD"."OwnerCode" , "ORD"."BPChCode" , "ORD"."BPChCntc" , "ORD"."PayToCode" , "ORD"."IsPaytoBnk" , "ORD"."BnkCntry" , "ORD"."BankCode" , "ORD"."BnkAccount" , "ORD"."BnkBranch" , "ORD"."isIns" , "ORD"."TrackNo" , "ORD"."VersionNum" , "ORD"."LangCode" , "ORD"."BPNameOW" , "ORD"."BillToOW" , "ORD"."ShipToOW" , "ORD"."RetInvoice" , "ORD"."ClsDate" , "ORD"."MInvNum" , "ORD"."MInvDate" , "ORD"."SeqCode" , "ORD"."Serial" , "ORD"."SeriesStr" , "ORD"."SubStr" , "ORD"."Model" , "ORD"."TaxOnExp" , "ORD"."TaxOnExpFc" , "ORD"."TaxOnExpSc" , "ORD"."TaxOnExAp" , "ORD"."TaxOnExApF" , "ORD"."TaxOnExApS" , "ORD"."LastPmnTyp" , "ORD"."LndCstNum" , "ORD"."UseCorrVat" , "ORD"."BlkCredMmo" , "ORD"."OpenForLaC" , "ORD"."Excised" , "ORD"."ExcRefDate" , "ORD"."ExcRmvTime" , "ORD"."SrvGpPrcnt" , "ORD"."DepositNum" , "ORD"."CertNum" , "ORD"."DutyStatus" , "ORD"."AutoCrtFlw" , "ORD"."FlwRefDate" , "ORD"."FlwRefNum" , "ORD"."VatJENum" , "ORD"."DpmVat" , "ORD"."DpmVatFc" , "ORD"."DpmVatSc" , "ORD"."DpmAppVat" , "ORD"."DpmAppVatF" , "ORD"."DpmAppVatS" , "ORD"."InsurOp347" , "ORD"."IgnRelDoc" , "ORD"."BuildDesc" , "ORD"."ResidenNum" , "ORD"."Checker" , "ORD"."Payee" , "ORD"."CopyNumber" , "ORD"."SSIExmpt" , "ORD"."PQTGrpSer" , "ORD"."PQTGrpNum" , "ORD"."PQTGrpHW" , "ORD"."ReopOriDoc" , "ORD"."ReopManCls" , "ORD"."DocManClsd" , "ORD"."ClosingOpt" , "ORD"."SpecDate" , "ORD"."Ordered" , "ORD"."NTSApprov" , "ORD"."NTSWebSite" , "ORD"."NTSeTaxNo" , "ORD"."NTSApprNo" , "ORD"."PayDuMonth" , "ORD"."ExtraMonth" , "ORD"."ExtraDays" , "ORD"."CdcOffset" , "ORD"."SignMsg" , "ORD"."SignDigest" , "ORD"."CertifNum" , "ORD"."KeyVersion" , "ORD"."EDocGenTyp" , "ORD"."ESeries" , "ORD"."EDocNum" , "ORD"."EDocExpFrm" , "ORD"."OnlineQuo" , "ORD"."POSEqNum" , "ORD"."POSManufSN" , "ORD"."POSCashN" , "ORD"."EDocStatus" , "ORD"."EDocCntnt" , "ORD"."EDocProces" , "ORD"."EDocErrCod" , "ORD"."EDocErrMsg" , "ORD"."EDocCancel" , "ORD"."EDocTest" , "ORD"."EDocPrefix" , "ORD"."CUP" , "ORD"."CIG" , "ORD"."DpmAsDscnt" , "ORD"."Attachment" , "ORD"."AtcEntry" , "ORD"."SupplCode" , "ORD"."GTSRlvnt" , "ORD"."BaseDisc" , "ORD"."BaseDiscSc" , "ORD"."BaseDiscFc" , "ORD"."BaseDiscPr" , "ORD"."CreateTS" , "ORD"."UpdateTS" , "ORD"."SrvTaxRule" , "ORD"."AnnInvDecR" , "ORD"."Supplier" , "ORD"."Releaser" , "ORD"."Receiver" , "ORD"."ToWhsCode" , "ORD"."AssetDate" , "ORD"."Requester" , "ORD"."ReqName" , "ORD"."Branch" , "ORD"."Department" , "ORD"."Email" , "ORD"."Notify" , "ORD"."ReqType" , "ORD"."OriginType" , "ORD"."IsReuseNum" , "ORD"."IsReuseNFN" , "ORD"."DocDlvry" , "ORD"."PaidDpm" , "ORD"."PaidDpmF" , "ORD"."PaidDpmS" , "ORD"."EnvTypeNFe" , "ORD"."AgrNo" , "ORD"."IsAlt" , "ORD"."AltBaseTyp" , "ORD"."AltBaseEnt" , "ORD"."AuthCode" , "ORD"."StDlvDate" , "ORD"."StDlvTime" , "ORD"."EndDlvDate" , "ORD"."EndDlvTime" , "ORD"."VclPlate" , "ORD"."ElCoStatus" , "ORD"."AtDocType" , "ORD"."ElCoMsg" , "ORD"."PrintSEPA" , "ORD"."FreeChrg" , "ORD"."FreeChrgFC" , "ORD"."FreeChrgSC" , "ORD"."NfeValue" , "ORD"."FiscDocNum" , "ORD"."RelatedTyp" , "ORD"."RelatedEnt" , "ORD"."CCDEntry" , "ORD"."NfePrntFo" , "ORD"."ZrdAbs" , "ORD"."POSRcptNo" , "ORD"."FoCTax" , "ORD"."FoCTaxFC" , "ORD"."FoCTaxSC" , "ORD"."TpCusPres" , "ORD"."ExcDocDate" , "ORD"."FoCFrght" , "ORD"."FoCFrghtFC" , "ORD"."FoCFrghtSC" , "ORD"."InterimTyp" , "ORD"."PTICode" , "ORD"."Letter" , "ORD"."FolNumFrom" , "ORD"."FolNumTo" , "ORD"."FolSeries" , "ORD"."SplitTax" , "ORD"."SplitTaxFC" , "ORD"."SplitTaxSC" , "ORD"."ToBinCode" , "ORD"."PriceMode" , "ORD"."PoDropPrss" , "ORD"."PermitNo" , "ORD"."MYFtype" , "ORD"."DocTaxID" , "ORD"."DateReport" , "ORD"."RepSection" , "ORD"."ExclTaxRep" , "ORD"."PosCashReg" , "ORD"."DmpTransID" , "ORD"."ECommerBP" , "ORD"."EComerGSTN" , "ORD"."Revision" , "ORD"."RevRefNo" , "ORD"."RevRefDate" , "ORD"."RevCreRefN" , "ORD"."RevCreRefD" , "ORD"."TaxInvNo" , "ORD"."FrmBpDate" , "ORD"."GSTTranTyp" , "ORD"."BaseType" , "ORD"."BaseEntry" , "ORD"."ComTrade" , "ORD"."UseBilAddr" , "ORD"."IssReason" , "ORD"."ComTradeRt" , "ORD"."SplitPmnt" , "ORD"."SOIWizId" , "ORD"."SelfPosted" , "ORD"."EnBnkAcct" , "ORD"."EncryptIV" , "ORD"."DPPStatus" , "ORD"."SAPPassprt" , "ORD"."EWBGenType" , "ORD"."CtActTax" , "ORD"."CtActTaxFC" , "ORD"."CtActTaxSC" , "ORD"."EDocType" , "ORD"."QRCodeSrc" , "ORD"."AggregDoc" , "ORD"."DataVers" , "ORD"."ShipState" , "ORD"."ShipPlace" , "ORD"."CustOffice" , "ORD"."FCI" , "ORD"."NnSbCuAmnt" , "ORD"."NnSbCuSC" , "ORD"."NnSbCuFC" , "ORD"."ExepCuAmnt" , "ORD"."ExepCuSC" , "ORD"."ExepCuFC" , "ORD"."AddLegIn" , "ORD"."LegTextF" , "ORD"."IndFinal" , "ORD"."DANFELgTxt" , "ORD"."PostPmntWT" , "ORD"."QRCodeSPGn" , "ORD"."FCEPmnMean" , "ORD"."ReqCode" , "ORD"."NotRel4MI" , "ORD"."Rel4PPTax" , "ORD"."U_POSFCOffline" , "ORD"."U_POSHCOffline" , "ORD"."U_POSLIdOffline" , "ORD"."U_ClaveFE" , "ORD"."U_Provincia" , "ORD"."U_Canton" , "ORD"."U_Distrito" , "ORD"."U_Barrio" , "ORD"."U_Direccion" , "ORD"."U_CLVS_POS_UniqueInvId" , "ORD"."U_DocDateOffline" , "ORD"."U_DocTimeOffline" , "ORD"."U_Online" , "ORD"."U_User" , "ORD"."U_ListNum" , "ORD"."U_FeNumProvRef" , "ORD"."U_BatchId" , "ORD"."U_DocumentKey" , "ORD"."U_NumIdentFE" , "ORD"."U_TipoIdentificacion" , "ORD"."U_EMA_numTransaccion_acumular" , "ORD"."U_EMA_Approval_Status" , "ORD"."U_EMA_numTransaccion_redimir" , "ORD"."U_TipoDocE" , "ORD"."U_CorreoFE" FROM OPOR AS Ord;



--182-----------------------------------------------------------182--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_UDF_OQUT_B1SLQuery" ( "DocEntry", "DocNum", "DocType", "CANCELED", "Handwrtten", "Printed", "DocStatus", "InvntSttus", "Transfered", "ObjType", "DocDate", "DocDueDate", "CardCode", "CardName", "Address", "NumAtCard", "VatPercent", "VatSum", "VatSumFC", "DiscPrcnt", "DiscSum", "DiscSumFC", "DocCur", "DocRate", "DocTotal", "DocTotalFC", "PaidToDate", "PaidFC", "GrosProfit", "GrosProfFC", "Ref1", "Ref2", "Comments", "JrnlMemo", "TransId", "ReceiptNum", "GroupNum", "DocTime", "SlpCode", "TrnspCode", "PartSupply", "Confirmed", "GrossBase", "ImportEnt", "CreateTran", "SummryType", "UpdInvnt", "UpdCardBal", "Instance", "Flags", "InvntDirec", "CntctCode", "ShowSCN", "FatherCard", "SysRate", "CurSource", "VatSumSy", "DiscSumSy", "DocTotalSy", "PaidSys", "FatherType", "GrosProfSy", "UpdateDate", "IsICT", "CreateDate", "Volume", "VolUnit", "Weight", "WeightUnit", "Series", "TaxDate", "Filler", "DataSource", "StampNum", "isCrin", "FinncPriod", "UserSign", "selfInv", "VatPaid", "VatPaidFC", "VatPaidSys", "UserSign2", "WddStatus", "draftKey", "TotalExpns", "TotalExpFC", "TotalExpSC", "DunnLevel", "Address2", "LogInstanc", "Exported", "StationID", "Indicator", "NetProc", "AqcsTax", "AqcsTaxFC", "AqcsTaxSC", "CashDiscPr", "CashDiscnt", "CashDiscFC", "CashDiscSC", "ShipToCode", "LicTradNum", "PaymentRef", "WTSum", "WTSumFC", "WTSumSC", "RoundDif", "RoundDifFC", "RoundDifSy", "CheckDigit", "Form1099", "Box1099", "submitted", "PoPrss", "Rounding", "RevisionPo", "Segment", "ReqDate", "CancelDate", "PickStatus", "Pick", "BlockDunn", "PeyMethod", "PayBlock", "PayBlckRef", "MaxDscn", "Reserve", "Max1099", "CntrlBnk", "PickRmrk", "ISRCodLine", "ExpAppl", "ExpApplFC", "ExpApplSC", "Project", "DeferrTax", "LetterNum", "FromDate", "ToDate", "WTApplied", "WTAppliedF", "BoeReserev", "AgentCode", "WTAppliedS", "EquVatSum", "EquVatSumF", "EquVatSumS", "Installmnt", "VATFirst", "NnSbAmnt", "NnSbAmntSC", "NbSbAmntFC", "ExepAmnt", "ExepAmntSC", "ExepAmntFC", "VatDate", "CorrExt", "CorrInv", "NCorrInv", "CEECFlag", "BaseAmnt", "BaseAmntSC", "BaseAmntFC", "CtlAccount", "BPLId", "BPLName", "VATRegNum", "TxInvRptNo", "TxInvRptDt", "KVVATCode", "WTDetails", "SumAbsId", "SumRptDate", "PIndicator", "ManualNum", "UseShpdGd", "BaseVtAt", "BaseVtAtSC", "BaseVtAtFC", "NnSbVAt", "NnSbVAtSC", "NbSbVAtFC", "ExptVAt", "ExptVAtSC", "ExptVAtFC", "LYPmtAt", "LYPmtAtSC", "LYPmtAtFC", "ExpAnSum", "ExpAnSys", "ExpAnFrgn", "DocSubType", "DpmStatus", "DpmAmnt", "DpmAmntSC", "DpmAmntFC", "DpmDrawn", "DpmPrcnt", "PaidSum", "PaidSumFc", "PaidSumSc", "FolioPref", "FolioNum", "DpmAppl", "DpmApplFc", "DpmApplSc", "LPgFolioN", "Header", "Footer", "Posted", "OwnerCode", "BPChCode", "BPChCntc", "PayToCode", "IsPaytoBnk", "BnkCntry", "BankCode", "BnkAccount", "BnkBranch", "isIns", "TrackNo", "VersionNum", "LangCode", "BPNameOW", "BillToOW", "ShipToOW", "RetInvoice", "ClsDate", "MInvNum", "MInvDate", "SeqCode", "Serial", "SeriesStr", "SubStr", "Model", "TaxOnExp", "TaxOnExpFc", "TaxOnExpSc", "TaxOnExAp", "TaxOnExApF", "TaxOnExApS", "LastPmnTyp", "LndCstNum", "UseCorrVat", "BlkCredMmo", "OpenForLaC", "Excised", "ExcRefDate", "ExcRmvTime", "SrvGpPrcnt", "DepositNum", "CertNum", "DutyStatus", "AutoCrtFlw", "FlwRefDate", "FlwRefNum", "VatJENum", "DpmVat", "DpmVatFc", "DpmVatSc", "DpmAppVat", "DpmAppVatF", "DpmAppVatS", "InsurOp347", "IgnRelDoc", "BuildDesc", "ResidenNum", "Checker", "Payee", "CopyNumber", "SSIExmpt", "PQTGrpSer", "PQTGrpNum", "PQTGrpHW", "ReopOriDoc", "ReopManCls", "DocManClsd", "ClosingOpt", "SpecDate", "Ordered", "NTSApprov", "NTSWebSite", "NTSeTaxNo", "NTSApprNo", "PayDuMonth", "ExtraMonth", "ExtraDays", "CdcOffset", "SignMsg", "SignDigest", "CertifNum", "KeyVersion", "EDocGenTyp", "ESeries", "EDocNum", "EDocExpFrm", "OnlineQuo", "POSEqNum", "POSManufSN", "POSCashN", "EDocStatus", "EDocCntnt", "EDocProces", "EDocErrCod", "EDocErrMsg", "EDocCancel", "EDocTest", "EDocPrefix", "CUP", "CIG", "DpmAsDscnt", "Attachment", "AtcEntry", "SupplCode", "GTSRlvnt", "BaseDisc", "BaseDiscSc", "BaseDiscFc", "BaseDiscPr", "CreateTS", "UpdateTS", "SrvTaxRule", "AnnInvDecR", "Supplier", "Releaser", "Receiver", "ToWhsCode", "AssetDate", "Requester", "ReqName", "Branch", "Department", "Email", "Notify", "ReqType", "OriginType", "IsReuseNum", "IsReuseNFN", "DocDlvry", "PaidDpm", "PaidDpmF", "PaidDpmS", "EnvTypeNFe", "AgrNo", "IsAlt", "AltBaseTyp", "AltBaseEnt", "AuthCode", "StDlvDate", "StDlvTime", "EndDlvDate", "EndDlvTime", "VclPlate", "ElCoStatus", "AtDocType", "ElCoMsg", "PrintSEPA", "FreeChrg", "FreeChrgFC", "FreeChrgSC", "NfeValue", "FiscDocNum", "RelatedTyp", "RelatedEnt", "CCDEntry", "NfePrntFo", "ZrdAbs", "POSRcptNo", "FoCTax", "FoCTaxFC", "FoCTaxSC", "TpCusPres", "ExcDocDate", "FoCFrght", "FoCFrghtFC", "FoCFrghtSC", "InterimTyp", "PTICode", "Letter", "FolNumFrom", "FolNumTo", "FolSeries", "SplitTax", "SplitTaxFC", "SplitTaxSC", "ToBinCode", "PriceMode", "PoDropPrss", "PermitNo", "MYFtype", "DocTaxID", "DateReport", "RepSection", "ExclTaxRep", "PosCashReg", "DmpTransID", "ECommerBP", "EComerGSTN", "Revision", "RevRefNo", "RevRefDate", "RevCreRefN", "RevCreRefD", "TaxInvNo", "FrmBpDate", "GSTTranTyp", "BaseType", "BaseEntry", "ComTrade", "UseBilAddr", "IssReason", "ComTradeRt", "SplitPmnt", "SOIWizId", "SelfPosted", "EnBnkAcct", "EncryptIV", "DPPStatus", "SAPPassprt", "EWBGenType", "CtActTax", "CtActTaxFC", "CtActTaxSC", "EDocType", "QRCodeSrc", "AggregDoc", "DataVers", "ShipState", "ShipPlace", "CustOffice", "FCI", "NnSbCuAmnt", "NnSbCuSC", "NnSbCuFC", "ExepCuAmnt", "ExepCuSC", "ExepCuFC", "AddLegIn", "LegTextF", "IndFinal", "DANFELgTxt", "PostPmntWT", "QRCodeSPGn", "FCEPmnMean", "ReqCode", "NotRel4MI", "Rel4PPTax", "U_POSFCOffline", "U_POSHCOffline", "U_POSLIdOffline", "U_ClaveFE", "U_Provincia", "U_Canton", "U_Distrito", "U_Barrio", "U_Direccion", "U_CLVS_POS_UniqueInvId", "U_DocDateOffline", "U_DocTimeOffline", "U_Online", "U_User", "U_ListNum", "U_FeNumProvRef", "U_BatchId", "U_DocumentKey", "U_NumIdentFE", "U_TipoIdentificacion", "U_EMA_numTransaccion_acumular", "U_EMA_Approval_Status", "U_EMA_numTransaccion_redimir", "U_TipoDocE", "U_CorreoFE" ) AS SELECT "ORD"."DocEntry" , "ORD"."DocNum" , "ORD"."DocType" , "ORD"."CANCELED" , "ORD"."Handwrtten" , "ORD"."Printed" , "ORD"."DocStatus" , "ORD"."InvntSttus" , "ORD"."Transfered" , "ORD"."ObjType" , "ORD"."DocDate" , "ORD"."DocDueDate" , "ORD"."CardCode" , "ORD"."CardName" , "ORD"."Address" , "ORD"."NumAtCard" , "ORD"."VatPercent" , "ORD"."VatSum" , "ORD"."VatSumFC" , "ORD"."DiscPrcnt" , "ORD"."DiscSum" , "ORD"."DiscSumFC" , "ORD"."DocCur" , "ORD"."DocRate" , "ORD"."DocTotal" , "ORD"."DocTotalFC" , "ORD"."PaidToDate" , "ORD"."PaidFC" , "ORD"."GrosProfit" , "ORD"."GrosProfFC" , "ORD"."Ref1" , "ORD"."Ref2" , "ORD"."Comments" , "ORD"."JrnlMemo" , "ORD"."TransId" , "ORD"."ReceiptNum" , "ORD"."GroupNum" , "ORD"."DocTime" , "ORD"."SlpCode" , "ORD"."TrnspCode" , "ORD"."PartSupply" , "ORD"."Confirmed" , "ORD"."GrossBase" , "ORD"."ImportEnt" , "ORD"."CreateTran" , "ORD"."SummryType" , "ORD"."UpdInvnt" , "ORD"."UpdCardBal" , "ORD"."Instance" , "ORD"."Flags" , "ORD"."InvntDirec" , "ORD"."CntctCode" , "ORD"."ShowSCN" , "ORD"."FatherCard" , "ORD"."SysRate" , "ORD"."CurSource" , "ORD"."VatSumSy" , "ORD"."DiscSumSy" , "ORD"."DocTotalSy" , "ORD"."PaidSys" , "ORD"."FatherType" , "ORD"."GrosProfSy" , "ORD"."UpdateDate" , "ORD"."IsICT" , "ORD"."CreateDate" , "ORD"."Volume" , "ORD"."VolUnit" , "ORD"."Weight" , "ORD"."WeightUnit" , "ORD"."Series" , "ORD"."TaxDate" , "ORD"."Filler" , "ORD"."DataSource" , "ORD"."StampNum" , "ORD"."isCrin" , "ORD"."FinncPriod" , "ORD"."UserSign" , "ORD"."selfInv" , "ORD"."VatPaid" , "ORD"."VatPaidFC" , "ORD"."VatPaidSys" , "ORD"."UserSign2" , "ORD"."WddStatus" , "ORD"."draftKey" , "ORD"."TotalExpns" , "ORD"."TotalExpFC" , "ORD"."TotalExpSC" , "ORD"."DunnLevel" , "ORD"."Address2" , "ORD"."LogInstanc" , "ORD"."Exported" , "ORD"."StationID" , "ORD"."Indicator" , "ORD"."NetProc" , "ORD"."AqcsTax" , "ORD"."AqcsTaxFC" , "ORD"."AqcsTaxSC" , "ORD"."CashDiscPr" , "ORD"."CashDiscnt" , "ORD"."CashDiscFC" , "ORD"."CashDiscSC" , "ORD"."ShipToCode" , "ORD"."LicTradNum" , "ORD"."PaymentRef" , "ORD"."WTSum" , "ORD"."WTSumFC" , "ORD"."WTSumSC" , "ORD"."RoundDif" , "ORD"."RoundDifFC" , "ORD"."RoundDifSy" , "ORD"."CheckDigit" , "ORD"."Form1099" , "ORD"."Box1099" , "ORD"."submitted" , "ORD"."PoPrss" , "ORD"."Rounding" , "ORD"."RevisionPo" , "ORD"."Segment" , "ORD"."ReqDate" , "ORD"."CancelDate" , "ORD"."PickStatus" , "ORD"."Pick" , "ORD"."BlockDunn" , "ORD"."PeyMethod" , "ORD"."PayBlock" , "ORD"."PayBlckRef" , "ORD"."MaxDscn" , "ORD"."Reserve" , "ORD"."Max1099" , "ORD"."CntrlBnk" , "ORD"."PickRmrk" , "ORD"."ISRCodLine" , "ORD"."ExpAppl" , "ORD"."ExpApplFC" , "ORD"."ExpApplSC" , "ORD"."Project" , "ORD"."DeferrTax" , "ORD"."LetterNum" , "ORD"."FromDate" , "ORD"."ToDate" , "ORD"."WTApplied" , "ORD"."WTAppliedF" , "ORD"."BoeReserev" , "ORD"."AgentCode" , "ORD"."WTAppliedS" , "ORD"."EquVatSum" , "ORD"."EquVatSumF" , "ORD"."EquVatSumS" , "ORD"."Installmnt" , "ORD"."VATFirst" , "ORD"."NnSbAmnt" , "ORD"."NnSbAmntSC" , "ORD"."NbSbAmntFC" , "ORD"."ExepAmnt" , "ORD"."ExepAmntSC" , "ORD"."ExepAmntFC" , "ORD"."VatDate" , "ORD"."CorrExt" , "ORD"."CorrInv" , "ORD"."NCorrInv" , "ORD"."CEECFlag" , "ORD"."BaseAmnt" , "ORD"."BaseAmntSC" , "ORD"."BaseAmntFC" , "ORD"."CtlAccount" , "ORD"."BPLId" , "ORD"."BPLName" , "ORD"."VATRegNum" , "ORD"."TxInvRptNo" , "ORD"."TxInvRptDt" , "ORD"."KVVATCode" , "ORD"."WTDetails" , "ORD"."SumAbsId" , "ORD"."SumRptDate" , "ORD"."PIndicator" , "ORD"."ManualNum" , "ORD"."UseShpdGd" , "ORD"."BaseVtAt" , "ORD"."BaseVtAtSC" , "ORD"."BaseVtAtFC" , "ORD"."NnSbVAt" , "ORD"."NnSbVAtSC" , "ORD"."NbSbVAtFC" , "ORD"."ExptVAt" , "ORD"."ExptVAtSC" , "ORD"."ExptVAtFC" , "ORD"."LYPmtAt" , "ORD"."LYPmtAtSC" , "ORD"."LYPmtAtFC" , "ORD"."ExpAnSum" , "ORD"."ExpAnSys" , "ORD"."ExpAnFrgn" , "ORD"."DocSubType" , "ORD"."DpmStatus" , "ORD"."DpmAmnt" , "ORD"."DpmAmntSC" , "ORD"."DpmAmntFC" , "ORD"."DpmDrawn" , "ORD"."DpmPrcnt" , "ORD"."PaidSum" , "ORD"."PaidSumFc" , "ORD"."PaidSumSc" , "ORD"."FolioPref" , "ORD"."FolioNum" , "ORD"."DpmAppl" , "ORD"."DpmApplFc" , "ORD"."DpmApplSc" , "ORD"."LPgFolioN" , "ORD"."Header" , "ORD"."Footer" , "ORD"."Posted" , "ORD"."OwnerCode" , "ORD"."BPChCode" , "ORD"."BPChCntc" , "ORD"."PayToCode" , "ORD"."IsPaytoBnk" , "ORD"."BnkCntry" , "ORD"."BankCode" , "ORD"."BnkAccount" , "ORD"."BnkBranch" , "ORD"."isIns" , "ORD"."TrackNo" , "ORD"."VersionNum" , "ORD"."LangCode" , "ORD"."BPNameOW" , "ORD"."BillToOW" , "ORD"."ShipToOW" , "ORD"."RetInvoice" , "ORD"."ClsDate" , "ORD"."MInvNum" , "ORD"."MInvDate" , "ORD"."SeqCode" , "ORD"."Serial" , "ORD"."SeriesStr" , "ORD"."SubStr" , "ORD"."Model" , "ORD"."TaxOnExp" , "ORD"."TaxOnExpFc" , "ORD"."TaxOnExpSc" , "ORD"."TaxOnExAp" , "ORD"."TaxOnExApF" , "ORD"."TaxOnExApS" , "ORD"."LastPmnTyp" , "ORD"."LndCstNum" , "ORD"."UseCorrVat" , "ORD"."BlkCredMmo" , "ORD"."OpenForLaC" , "ORD"."Excised" , "ORD"."ExcRefDate" , "ORD"."ExcRmvTime" , "ORD"."SrvGpPrcnt" , "ORD"."DepositNum" , "ORD"."CertNum" , "ORD"."DutyStatus" , "ORD"."AutoCrtFlw" , "ORD"."FlwRefDate" , "ORD"."FlwRefNum" , "ORD"."VatJENum" , "ORD"."DpmVat" , "ORD"."DpmVatFc" , "ORD"."DpmVatSc" , "ORD"."DpmAppVat" , "ORD"."DpmAppVatF" , "ORD"."DpmAppVatS" , "ORD"."InsurOp347" , "ORD"."IgnRelDoc" , "ORD"."BuildDesc" , "ORD"."ResidenNum" , "ORD"."Checker" , "ORD"."Payee" , "ORD"."CopyNumber" , "ORD"."SSIExmpt" , "ORD"."PQTGrpSer" , "ORD"."PQTGrpNum" , "ORD"."PQTGrpHW" , "ORD"."ReopOriDoc" , "ORD"."ReopManCls" , "ORD"."DocManClsd" , "ORD"."ClosingOpt" , "ORD"."SpecDate" , "ORD"."Ordered" , "ORD"."NTSApprov" , "ORD"."NTSWebSite" , "ORD"."NTSeTaxNo" , "ORD"."NTSApprNo" , "ORD"."PayDuMonth" , "ORD"."ExtraMonth" , "ORD"."ExtraDays" , "ORD"."CdcOffset" , "ORD"."SignMsg" , "ORD"."SignDigest" , "ORD"."CertifNum" , "ORD"."KeyVersion" , "ORD"."EDocGenTyp" , "ORD"."ESeries" , "ORD"."EDocNum" , "ORD"."EDocExpFrm" , "ORD"."OnlineQuo" , "ORD"."POSEqNum" , "ORD"."POSManufSN" , "ORD"."POSCashN" , "ORD"."EDocStatus" , "ORD"."EDocCntnt" , "ORD"."EDocProces" , "ORD"."EDocErrCod" , "ORD"."EDocErrMsg" , "ORD"."EDocCancel" , "ORD"."EDocTest" , "ORD"."EDocPrefix" , "ORD"."CUP" , "ORD"."CIG" , "ORD"."DpmAsDscnt" , "ORD"."Attachment" , "ORD"."AtcEntry" , "ORD"."SupplCode" , "ORD"."GTSRlvnt" , "ORD"."BaseDisc" , "ORD"."BaseDiscSc" , "ORD"."BaseDiscFc" , "ORD"."BaseDiscPr" , "ORD"."CreateTS" , "ORD"."UpdateTS" , "ORD"."SrvTaxRule" , "ORD"."AnnInvDecR" , "ORD"."Supplier" , "ORD"."Releaser" , "ORD"."Receiver" , "ORD"."ToWhsCode" , "ORD"."AssetDate" , "ORD"."Requester" , "ORD"."ReqName" , "ORD"."Branch" , "ORD"."Department" , "ORD"."Email" , "ORD"."Notify" , "ORD"."ReqType" , "ORD"."OriginType" , "ORD"."IsReuseNum" , "ORD"."IsReuseNFN" , "ORD"."DocDlvry" , "ORD"."PaidDpm" , "ORD"."PaidDpmF" , "ORD"."PaidDpmS" , "ORD"."EnvTypeNFe" , "ORD"."AgrNo" , "ORD"."IsAlt" , "ORD"."AltBaseTyp" , "ORD"."AltBaseEnt" , "ORD"."AuthCode" , "ORD"."StDlvDate" , "ORD"."StDlvTime" , "ORD"."EndDlvDate" , "ORD"."EndDlvTime" , "ORD"."VclPlate" , "ORD"."ElCoStatus" , "ORD"."AtDocType" , "ORD"."ElCoMsg" , "ORD"."PrintSEPA" , "ORD"."FreeChrg" , "ORD"."FreeChrgFC" , "ORD"."FreeChrgSC" , "ORD"."NfeValue" , "ORD"."FiscDocNum" , "ORD"."RelatedTyp" , "ORD"."RelatedEnt" , "ORD"."CCDEntry" , "ORD"."NfePrntFo" , "ORD"."ZrdAbs" , "ORD"."POSRcptNo" , "ORD"."FoCTax" , "ORD"."FoCTaxFC" , "ORD"."FoCTaxSC" , "ORD"."TpCusPres" , "ORD"."ExcDocDate" , "ORD"."FoCFrght" , "ORD"."FoCFrghtFC" , "ORD"."FoCFrghtSC" , "ORD"."InterimTyp" , "ORD"."PTICode" , "ORD"."Letter" , "ORD"."FolNumFrom" , "ORD"."FolNumTo" , "ORD"."FolSeries" , "ORD"."SplitTax" , "ORD"."SplitTaxFC" , "ORD"."SplitTaxSC" , "ORD"."ToBinCode" , "ORD"."PriceMode" , "ORD"."PoDropPrss" , "ORD"."PermitNo" , "ORD"."MYFtype" , "ORD"."DocTaxID" , "ORD"."DateReport" , "ORD"."RepSection" , "ORD"."ExclTaxRep" , "ORD"."PosCashReg" , "ORD"."DmpTransID" , "ORD"."ECommerBP" , "ORD"."EComerGSTN" , "ORD"."Revision" , "ORD"."RevRefNo" , "ORD"."RevRefDate" , "ORD"."RevCreRefN" , "ORD"."RevCreRefD" , "ORD"."TaxInvNo" , "ORD"."FrmBpDate" , "ORD"."GSTTranTyp" , "ORD"."BaseType" , "ORD"."BaseEntry" , "ORD"."ComTrade" , "ORD"."UseBilAddr" , "ORD"."IssReason" , "ORD"."ComTradeRt" , "ORD"."SplitPmnt" , "ORD"."SOIWizId" , "ORD"."SelfPosted" , "ORD"."EnBnkAcct" , "ORD"."EncryptIV" , "ORD"."DPPStatus" , "ORD"."SAPPassprt" , "ORD"."EWBGenType" , "ORD"."CtActTax" , "ORD"."CtActTaxFC" , "ORD"."CtActTaxSC" , "ORD"."EDocType" , "ORD"."QRCodeSrc" , "ORD"."AggregDoc" , "ORD"."DataVers" , "ORD"."ShipState" , "ORD"."ShipPlace" , "ORD"."CustOffice" , "ORD"."FCI" , "ORD"."NnSbCuAmnt" , "ORD"."NnSbCuSC" , "ORD"."NnSbCuFC" , "ORD"."ExepCuAmnt" , "ORD"."ExepCuSC" , "ORD"."ExepCuFC" , "ORD"."AddLegIn" , "ORD"."LegTextF" , "ORD"."IndFinal" , "ORD"."DANFELgTxt" , "ORD"."PostPmntWT" , "ORD"."QRCodeSPGn" , "ORD"."FCEPmnMean" , "ORD"."ReqCode" , "ORD"."NotRel4MI" , "ORD"."Rel4PPTax" , "ORD"."U_POSFCOffline" , "ORD"."U_POSHCOffline" , "ORD"."U_POSLIdOffline" , "ORD"."U_ClaveFE" , "ORD"."U_Provincia" , "ORD"."U_Canton" , "ORD"."U_Distrito" , "ORD"."U_Barrio" , "ORD"."U_Direccion" , "ORD"."U_CLVS_POS_UniqueInvId" , "ORD"."U_DocDateOffline" , "ORD"."U_DocTimeOffline" , "ORD"."U_Online" , "ORD"."U_User" , "ORD"."U_ListNum" , "ORD"."U_FeNumProvRef" , "ORD"."U_BatchId" , "ORD"."U_DocumentKey" , "ORD"."U_NumIdentFE" , "ORD"."U_TipoIdentificacion" , "ORD"."U_EMA_numTransaccion_acumular" , "ORD"."U_EMA_Approval_Status" , "ORD"."U_EMA_numTransaccion_redimir" , "ORD"."U_TipoDocE" , "ORD"."U_CorreoFE" FROM OQUT AS Ord;



--183-----------------------------------------------------------183--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_UDF_ORDR_B1SLQuery" ( "DocEntry", "DocNum", "DocType", "CANCELED", "Handwrtten", "Printed", "DocStatus", "InvntSttus", "Transfered", "ObjType", "DocDate", "DocDueDate", "CardCode", "CardName", "Address", "NumAtCard", "VatPercent", "VatSum", "VatSumFC", "DiscPrcnt", "DiscSum", "DiscSumFC", "DocCur", "DocRate", "DocTotal", "DocTotalFC", "PaidToDate", "PaidFC", "GrosProfit", "GrosProfFC", "Ref1", "Ref2", "Comments", "JrnlMemo", "TransId", "ReceiptNum", "GroupNum", "DocTime", "SlpCode", "TrnspCode", "PartSupply", "Confirmed", "GrossBase", "ImportEnt", "CreateTran", "SummryType", "UpdInvnt", "UpdCardBal", "Instance", "Flags", "InvntDirec", "CntctCode", "ShowSCN", "FatherCard", "SysRate", "CurSource", "VatSumSy", "DiscSumSy", "DocTotalSy", "PaidSys", "FatherType", "GrosProfSy", "UpdateDate", "IsICT", "CreateDate", "Volume", "VolUnit", "Weight", "WeightUnit", "Series", "TaxDate", "Filler", "DataSource", "StampNum", "isCrin", "FinncPriod", "UserSign", "selfInv", "VatPaid", "VatPaidFC", "VatPaidSys", "UserSign2", "WddStatus", "draftKey", "TotalExpns", "TotalExpFC", "TotalExpSC", "DunnLevel", "Address2", "LogInstanc", "Exported", "StationID", "Indicator", "NetProc", "AqcsTax", "AqcsTaxFC", "AqcsTaxSC", "CashDiscPr", "CashDiscnt", "CashDiscFC", "CashDiscSC", "ShipToCode", "LicTradNum", "PaymentRef", "WTSum", "WTSumFC", "WTSumSC", "RoundDif", "RoundDifFC", "RoundDifSy", "CheckDigit", "Form1099", "Box1099", "submitted", "PoPrss", "Rounding", "RevisionPo", "Segment", "ReqDate", "CancelDate", "PickStatus", "Pick", "BlockDunn", "PeyMethod", "PayBlock", "PayBlckRef", "MaxDscn", "Reserve", "Max1099", "CntrlBnk", "PickRmrk", "ISRCodLine", "ExpAppl", "ExpApplFC", "ExpApplSC", "Project", "DeferrTax", "LetterNum", "FromDate", "ToDate", "WTApplied", "WTAppliedF", "BoeReserev", "AgentCode", "WTAppliedS", "EquVatSum", "EquVatSumF", "EquVatSumS", "Installmnt", "VATFirst", "NnSbAmnt", "NnSbAmntSC", "NbSbAmntFC", "ExepAmnt", "ExepAmntSC", "ExepAmntFC", "VatDate", "CorrExt", "CorrInv", "NCorrInv", "CEECFlag", "BaseAmnt", "BaseAmntSC", "BaseAmntFC", "CtlAccount", "BPLId", "BPLName", "VATRegNum", "TxInvRptNo", "TxInvRptDt", "KVVATCode", "WTDetails", "SumAbsId", "SumRptDate", "PIndicator", "ManualNum", "UseShpdGd", "BaseVtAt", "BaseVtAtSC", "BaseVtAtFC", "NnSbVAt", "NnSbVAtSC", "NbSbVAtFC", "ExptVAt", "ExptVAtSC", "ExptVAtFC", "LYPmtAt", "LYPmtAtSC", "LYPmtAtFC", "ExpAnSum", "ExpAnSys", "ExpAnFrgn", "DocSubType", "DpmStatus", "DpmAmnt", "DpmAmntSC", "DpmAmntFC", "DpmDrawn", "DpmPrcnt", "PaidSum", "PaidSumFc", "PaidSumSc", "FolioPref", "FolioNum", "DpmAppl", "DpmApplFc", "DpmApplSc", "LPgFolioN", "Header", "Footer", "Posted", "OwnerCode", "BPChCode", "BPChCntc", "PayToCode", "IsPaytoBnk", "BnkCntry", "BankCode", "BnkAccount", "BnkBranch", "isIns", "TrackNo", "VersionNum", "LangCode", "BPNameOW", "BillToOW", "ShipToOW", "RetInvoice", "ClsDate", "MInvNum", "MInvDate", "SeqCode", "Serial", "SeriesStr", "SubStr", "Model", "TaxOnExp", "TaxOnExpFc", "TaxOnExpSc", "TaxOnExAp", "TaxOnExApF", "TaxOnExApS", "LastPmnTyp", "LndCstNum", "UseCorrVat", "BlkCredMmo", "OpenForLaC", "Excised", "ExcRefDate", "ExcRmvTime", "SrvGpPrcnt", "DepositNum", "CertNum", "DutyStatus", "AutoCrtFlw", "FlwRefDate", "FlwRefNum", "VatJENum", "DpmVat", "DpmVatFc", "DpmVatSc", "DpmAppVat", "DpmAppVatF", "DpmAppVatS", "InsurOp347", "IgnRelDoc", "BuildDesc", "ResidenNum", "Checker", "Payee", "CopyNumber", "SSIExmpt", "PQTGrpSer", "PQTGrpNum", "PQTGrpHW", "ReopOriDoc", "ReopManCls", "DocManClsd", "ClosingOpt", "SpecDate", "Ordered", "NTSApprov", "NTSWebSite", "NTSeTaxNo", "NTSApprNo", "PayDuMonth", "ExtraMonth", "ExtraDays", "CdcOffset", "SignMsg", "SignDigest", "CertifNum", "KeyVersion", "EDocGenTyp", "ESeries", "EDocNum", "EDocExpFrm", "OnlineQuo", "POSEqNum", "POSManufSN", "POSCashN", "EDocStatus", "EDocCntnt", "EDocProces", "EDocErrCod", "EDocErrMsg", "EDocCancel", "EDocTest", "EDocPrefix", "CUP", "CIG", "DpmAsDscnt", "Attachment", "AtcEntry", "SupplCode", "GTSRlvnt", "BaseDisc", "BaseDiscSc", "BaseDiscFc", "BaseDiscPr", "CreateTS", "UpdateTS", "SrvTaxRule", "AnnInvDecR", "Supplier", "Releaser", "Receiver", "ToWhsCode", "AssetDate", "Requester", "ReqName", "Branch", "Department", "Email", "Notify", "ReqType", "OriginType", "IsReuseNum", "IsReuseNFN", "DocDlvry", "PaidDpm", "PaidDpmF", "PaidDpmS", "EnvTypeNFe", "AgrNo", "IsAlt", "AltBaseTyp", "AltBaseEnt", "AuthCode", "StDlvDate", "StDlvTime", "EndDlvDate", "EndDlvTime", "VclPlate", "ElCoStatus", "AtDocType", "ElCoMsg", "PrintSEPA", "FreeChrg", "FreeChrgFC", "FreeChrgSC", "NfeValue", "FiscDocNum", "RelatedTyp", "RelatedEnt", "CCDEntry", "NfePrntFo", "ZrdAbs", "POSRcptNo", "FoCTax", "FoCTaxFC", "FoCTaxSC", "TpCusPres", "ExcDocDate", "FoCFrght", "FoCFrghtFC", "FoCFrghtSC", "InterimTyp", "PTICode", "Letter", "FolNumFrom", "FolNumTo", "FolSeries", "SplitTax", "SplitTaxFC", "SplitTaxSC", "ToBinCode", "PriceMode", "PoDropPrss", "PermitNo", "MYFtype", "DocTaxID", "DateReport", "RepSection", "ExclTaxRep", "PosCashReg", "DmpTransID", "ECommerBP", "EComerGSTN", "Revision", "RevRefNo", "RevRefDate", "RevCreRefN", "RevCreRefD", "TaxInvNo", "FrmBpDate", "GSTTranTyp", "BaseType", "BaseEntry", "ComTrade", "UseBilAddr", "IssReason", "ComTradeRt", "SplitPmnt", "SOIWizId", "SelfPosted", "EnBnkAcct", "EncryptIV", "DPPStatus", "SAPPassprt", "EWBGenType", "CtActTax", "CtActTaxFC", "CtActTaxSC", "EDocType", "QRCodeSrc", "AggregDoc", "DataVers", "ShipState", "ShipPlace", "CustOffice", "FCI", "NnSbCuAmnt", "NnSbCuSC", "NnSbCuFC", "ExepCuAmnt", "ExepCuSC", "ExepCuFC", "AddLegIn", "LegTextF", "IndFinal", "DANFELgTxt", "PostPmntWT", "QRCodeSPGn", "FCEPmnMean", "ReqCode", "NotRel4MI", "Rel4PPTax", "U_POSFCOffline", "U_POSHCOffline", "U_POSLIdOffline", "U_ClaveFE", "U_Provincia", "U_Canton", "U_Distrito", "U_Barrio", "U_Direccion", "U_CLVS_POS_UniqueInvId", "U_DocDateOffline", "U_DocTimeOffline", "U_Online", "U_User", "U_ListNum", "U_FeNumProvRef", "U_BatchId", "U_DocumentKey", "U_NumIdentFE", "U_TipoIdentificacion", "U_EMA_numTransaccion_acumular", "U_EMA_Approval_Status", "U_EMA_numTransaccion_redimir", "U_TipoDocE", "U_CorreoFE" ) AS SELECT "ORD"."DocEntry" , "ORD"."DocNum" , "ORD"."DocType" , "ORD"."CANCELED" , "ORD"."Handwrtten" , "ORD"."Printed" , "ORD"."DocStatus" , "ORD"."InvntSttus" , "ORD"."Transfered" , "ORD"."ObjType" , "ORD"."DocDate" , "ORD"."DocDueDate" , "ORD"."CardCode" , "ORD"."CardName" , "ORD"."Address" , "ORD"."NumAtCard" , "ORD"."VatPercent" , "ORD"."VatSum" , "ORD"."VatSumFC" , "ORD"."DiscPrcnt" , "ORD"."DiscSum" , "ORD"."DiscSumFC" , "ORD"."DocCur" , "ORD"."DocRate" , "ORD"."DocTotal" , "ORD"."DocTotalFC" , "ORD"."PaidToDate" , "ORD"."PaidFC" , "ORD"."GrosProfit" , "ORD"."GrosProfFC" , "ORD"."Ref1" , "ORD"."Ref2" , "ORD"."Comments" , "ORD"."JrnlMemo" , "ORD"."TransId" , "ORD"."ReceiptNum" , "ORD"."GroupNum" , "ORD"."DocTime" , "ORD"."SlpCode" , "ORD"."TrnspCode" , "ORD"."PartSupply" , "ORD"."Confirmed" , "ORD"."GrossBase" , "ORD"."ImportEnt" , "ORD"."CreateTran" , "ORD"."SummryType" , "ORD"."UpdInvnt" , "ORD"."UpdCardBal" , "ORD"."Instance" , "ORD"."Flags" , "ORD"."InvntDirec" , "ORD"."CntctCode" , "ORD"."ShowSCN" , "ORD"."FatherCard" , "ORD"."SysRate" , "ORD"."CurSource" , "ORD"."VatSumSy" , "ORD"."DiscSumSy" , "ORD"."DocTotalSy" , "ORD"."PaidSys" , "ORD"."FatherType" , "ORD"."GrosProfSy" , "ORD"."UpdateDate" , "ORD"."IsICT" , "ORD"."CreateDate" , "ORD"."Volume" , "ORD"."VolUnit" , "ORD"."Weight" , "ORD"."WeightUnit" , "ORD"."Series" , "ORD"."TaxDate" , "ORD"."Filler" , "ORD"."DataSource" , "ORD"."StampNum" , "ORD"."isCrin" , "ORD"."FinncPriod" , "ORD"."UserSign" , "ORD"."selfInv" , "ORD"."VatPaid" , "ORD"."VatPaidFC" , "ORD"."VatPaidSys" , "ORD"."UserSign2" , "ORD"."WddStatus" , "ORD"."draftKey" , "ORD"."TotalExpns" , "ORD"."TotalExpFC" , "ORD"."TotalExpSC" , "ORD"."DunnLevel" , "ORD"."Address2" , "ORD"."LogInstanc" , "ORD"."Exported" , "ORD"."StationID" , "ORD"."Indicator" , "ORD"."NetProc" , "ORD"."AqcsTax" , "ORD"."AqcsTaxFC" , "ORD"."AqcsTaxSC" , "ORD"."CashDiscPr" , "ORD"."CashDiscnt" , "ORD"."CashDiscFC" , "ORD"."CashDiscSC" , "ORD"."ShipToCode" , "ORD"."LicTradNum" , "ORD"."PaymentRef" , "ORD"."WTSum" , "ORD"."WTSumFC" , "ORD"."WTSumSC" , "ORD"."RoundDif" , "ORD"."RoundDifFC" , "ORD"."RoundDifSy" , "ORD"."CheckDigit" , "ORD"."Form1099" , "ORD"."Box1099" , "ORD"."submitted" , "ORD"."PoPrss" , "ORD"."Rounding" , "ORD"."RevisionPo" , "ORD"."Segment" , "ORD"."ReqDate" , "ORD"."CancelDate" , "ORD"."PickStatus" , "ORD"."Pick" , "ORD"."BlockDunn" , "ORD"."PeyMethod" , "ORD"."PayBlock" , "ORD"."PayBlckRef" , "ORD"."MaxDscn" , "ORD"."Reserve" , "ORD"."Max1099" , "ORD"."CntrlBnk" , "ORD"."PickRmrk" , "ORD"."ISRCodLine" , "ORD"."ExpAppl" , "ORD"."ExpApplFC" , "ORD"."ExpApplSC" , "ORD"."Project" , "ORD"."DeferrTax" , "ORD"."LetterNum" , "ORD"."FromDate" , "ORD"."ToDate" , "ORD"."WTApplied" , "ORD"."WTAppliedF" , "ORD"."BoeReserev" , "ORD"."AgentCode" , "ORD"."WTAppliedS" , "ORD"."EquVatSum" , "ORD"."EquVatSumF" , "ORD"."EquVatSumS" , "ORD"."Installmnt" , "ORD"."VATFirst" , "ORD"."NnSbAmnt" , "ORD"."NnSbAmntSC" , "ORD"."NbSbAmntFC" , "ORD"."ExepAmnt" , "ORD"."ExepAmntSC" , "ORD"."ExepAmntFC" , "ORD"."VatDate" , "ORD"."CorrExt" , "ORD"."CorrInv" , "ORD"."NCorrInv" , "ORD"."CEECFlag" , "ORD"."BaseAmnt" , "ORD"."BaseAmntSC" , "ORD"."BaseAmntFC" , "ORD"."CtlAccount" , "ORD"."BPLId" , "ORD"."BPLName" , "ORD"."VATRegNum" , "ORD"."TxInvRptNo" , "ORD"."TxInvRptDt" , "ORD"."KVVATCode" , "ORD"."WTDetails" , "ORD"."SumAbsId" , "ORD"."SumRptDate" , "ORD"."PIndicator" , "ORD"."ManualNum" , "ORD"."UseShpdGd" , "ORD"."BaseVtAt" , "ORD"."BaseVtAtSC" , "ORD"."BaseVtAtFC" , "ORD"."NnSbVAt" , "ORD"."NnSbVAtSC" , "ORD"."NbSbVAtFC" , "ORD"."ExptVAt" , "ORD"."ExptVAtSC" , "ORD"."ExptVAtFC" , "ORD"."LYPmtAt" , "ORD"."LYPmtAtSC" , "ORD"."LYPmtAtFC" , "ORD"."ExpAnSum" , "ORD"."ExpAnSys" , "ORD"."ExpAnFrgn" , "ORD"."DocSubType" , "ORD"."DpmStatus" , "ORD"."DpmAmnt" , "ORD"."DpmAmntSC" , "ORD"."DpmAmntFC" , "ORD"."DpmDrawn" , "ORD"."DpmPrcnt" , "ORD"."PaidSum" , "ORD"."PaidSumFc" , "ORD"."PaidSumSc" , "ORD"."FolioPref" , "ORD"."FolioNum" , "ORD"."DpmAppl" , "ORD"."DpmApplFc" , "ORD"."DpmApplSc" , "ORD"."LPgFolioN" , "ORD"."Header" , "ORD"."Footer" , "ORD"."Posted" , "ORD"."OwnerCode" , "ORD"."BPChCode" , "ORD"."BPChCntc" , "ORD"."PayToCode" , "ORD"."IsPaytoBnk" , "ORD"."BnkCntry" , "ORD"."BankCode" , "ORD"."BnkAccount" , "ORD"."BnkBranch" , "ORD"."isIns" , "ORD"."TrackNo" , "ORD"."VersionNum" , "ORD"."LangCode" , "ORD"."BPNameOW" , "ORD"."BillToOW" , "ORD"."ShipToOW" , "ORD"."RetInvoice" , "ORD"."ClsDate" , "ORD"."MInvNum" , "ORD"."MInvDate" , "ORD"."SeqCode" , "ORD"."Serial" , "ORD"."SeriesStr" , "ORD"."SubStr" , "ORD"."Model" , "ORD"."TaxOnExp" , "ORD"."TaxOnExpFc" , "ORD"."TaxOnExpSc" , "ORD"."TaxOnExAp" , "ORD"."TaxOnExApF" , "ORD"."TaxOnExApS" , "ORD"."LastPmnTyp" , "ORD"."LndCstNum" , "ORD"."UseCorrVat" , "ORD"."BlkCredMmo" , "ORD"."OpenForLaC" , "ORD"."Excised" , "ORD"."ExcRefDate" , "ORD"."ExcRmvTime" , "ORD"."SrvGpPrcnt" , "ORD"."DepositNum" , "ORD"."CertNum" , "ORD"."DutyStatus" , "ORD"."AutoCrtFlw" , "ORD"."FlwRefDate" , "ORD"."FlwRefNum" , "ORD"."VatJENum" , "ORD"."DpmVat" , "ORD"."DpmVatFc" , "ORD"."DpmVatSc" , "ORD"."DpmAppVat" , "ORD"."DpmAppVatF" , "ORD"."DpmAppVatS" , "ORD"."InsurOp347" , "ORD"."IgnRelDoc" , "ORD"."BuildDesc" , "ORD"."ResidenNum" , "ORD"."Checker" , "ORD"."Payee" , "ORD"."CopyNumber" , "ORD"."SSIExmpt" , "ORD"."PQTGrpSer" , "ORD"."PQTGrpNum" , "ORD"."PQTGrpHW" , "ORD"."ReopOriDoc" , "ORD"."ReopManCls" , "ORD"."DocManClsd" , "ORD"."ClosingOpt" , "ORD"."SpecDate" , "ORD"."Ordered" , "ORD"."NTSApprov" , "ORD"."NTSWebSite" , "ORD"."NTSeTaxNo" , "ORD"."NTSApprNo" , "ORD"."PayDuMonth" , "ORD"."ExtraMonth" , "ORD"."ExtraDays" , "ORD"."CdcOffset" , "ORD"."SignMsg" , "ORD"."SignDigest" , "ORD"."CertifNum" , "ORD"."KeyVersion" , "ORD"."EDocGenTyp" , "ORD"."ESeries" , "ORD"."EDocNum" , "ORD"."EDocExpFrm" , "ORD"."OnlineQuo" , "ORD"."POSEqNum" , "ORD"."POSManufSN" , "ORD"."POSCashN" , "ORD"."EDocStatus" , "ORD"."EDocCntnt" , "ORD"."EDocProces" , "ORD"."EDocErrCod" , "ORD"."EDocErrMsg" , "ORD"."EDocCancel" , "ORD"."EDocTest" , "ORD"."EDocPrefix" , "ORD"."CUP" , "ORD"."CIG" , "ORD"."DpmAsDscnt" , "ORD"."Attachment" , "ORD"."AtcEntry" , "ORD"."SupplCode" , "ORD"."GTSRlvnt" , "ORD"."BaseDisc" , "ORD"."BaseDiscSc" , "ORD"."BaseDiscFc" , "ORD"."BaseDiscPr" , "ORD"."CreateTS" , "ORD"."UpdateTS" , "ORD"."SrvTaxRule" , "ORD"."AnnInvDecR" , "ORD"."Supplier" , "ORD"."Releaser" , "ORD"."Receiver" , "ORD"."ToWhsCode" , "ORD"."AssetDate" , "ORD"."Requester" , "ORD"."ReqName" , "ORD"."Branch" , "ORD"."Department" , "ORD"."Email" , "ORD"."Notify" , "ORD"."ReqType" , "ORD"."OriginType" , "ORD"."IsReuseNum" , "ORD"."IsReuseNFN" , "ORD"."DocDlvry" , "ORD"."PaidDpm" , "ORD"."PaidDpmF" , "ORD"."PaidDpmS" , "ORD"."EnvTypeNFe" , "ORD"."AgrNo" , "ORD"."IsAlt" , "ORD"."AltBaseTyp" , "ORD"."AltBaseEnt" , "ORD"."AuthCode" , "ORD"."StDlvDate" , "ORD"."StDlvTime" , "ORD"."EndDlvDate" , "ORD"."EndDlvTime" , "ORD"."VclPlate" , "ORD"."ElCoStatus" , "ORD"."AtDocType" , "ORD"."ElCoMsg" , "ORD"."PrintSEPA" , "ORD"."FreeChrg" , "ORD"."FreeChrgFC" , "ORD"."FreeChrgSC" , "ORD"."NfeValue" , "ORD"."FiscDocNum" , "ORD"."RelatedTyp" , "ORD"."RelatedEnt" , "ORD"."CCDEntry" , "ORD"."NfePrntFo" , "ORD"."ZrdAbs" , "ORD"."POSRcptNo" , "ORD"."FoCTax" , "ORD"."FoCTaxFC" , "ORD"."FoCTaxSC" , "ORD"."TpCusPres" , "ORD"."ExcDocDate" , "ORD"."FoCFrght" , "ORD"."FoCFrghtFC" , "ORD"."FoCFrghtSC" , "ORD"."InterimTyp" , "ORD"."PTICode" , "ORD"."Letter" , "ORD"."FolNumFrom" , "ORD"."FolNumTo" , "ORD"."FolSeries" , "ORD"."SplitTax" , "ORD"."SplitTaxFC" , "ORD"."SplitTaxSC" , "ORD"."ToBinCode" , "ORD"."PriceMode" , "ORD"."PoDropPrss" , "ORD"."PermitNo" , "ORD"."MYFtype" , "ORD"."DocTaxID" , "ORD"."DateReport" , "ORD"."RepSection" , "ORD"."ExclTaxRep" , "ORD"."PosCashReg" , "ORD"."DmpTransID" , "ORD"."ECommerBP" , "ORD"."EComerGSTN" , "ORD"."Revision" , "ORD"."RevRefNo" , "ORD"."RevRefDate" , "ORD"."RevCreRefN" , "ORD"."RevCreRefD" , "ORD"."TaxInvNo" , "ORD"."FrmBpDate" , "ORD"."GSTTranTyp" , "ORD"."BaseType" , "ORD"."BaseEntry" , "ORD"."ComTrade" , "ORD"."UseBilAddr" , "ORD"."IssReason" , "ORD"."ComTradeRt" , "ORD"."SplitPmnt" , "ORD"."SOIWizId" , "ORD"."SelfPosted" , "ORD"."EnBnkAcct" , "ORD"."EncryptIV" , "ORD"."DPPStatus" , "ORD"."SAPPassprt" , "ORD"."EWBGenType" , "ORD"."CtActTax" , "ORD"."CtActTaxFC" , "ORD"."CtActTaxSC" , "ORD"."EDocType" , "ORD"."QRCodeSrc" , "ORD"."AggregDoc" , "ORD"."DataVers" , "ORD"."ShipState" , "ORD"."ShipPlace" , "ORD"."CustOffice" , "ORD"."FCI" , "ORD"."NnSbCuAmnt" , "ORD"."NnSbCuSC" , "ORD"."NnSbCuFC" , "ORD"."ExepCuAmnt" , "ORD"."ExepCuSC" , "ORD"."ExepCuFC" , "ORD"."AddLegIn" , "ORD"."LegTextF" , "ORD"."IndFinal" , "ORD"."DANFELgTxt" , "ORD"."PostPmntWT" , "ORD"."QRCodeSPGn" , "ORD"."FCEPmnMean" , "ORD"."ReqCode" , "ORD"."NotRel4MI" , "ORD"."Rel4PPTax" , "ORD"."U_POSFCOffline" , "ORD"."U_POSHCOffline" , "ORD"."U_POSLIdOffline" , "ORD"."U_ClaveFE" , "ORD"."U_Provincia" , "ORD"."U_Canton" , "ORD"."U_Distrito" , "ORD"."U_Barrio" , "ORD"."U_Direccion" , "ORD"."U_CLVS_POS_UniqueInvId" , "ORD"."U_DocDateOffline" , "ORD"."U_DocTimeOffline" , "ORD"."U_Online" , "ORD"."U_User" , "ORD"."U_ListNum" , "ORD"."U_FeNumProvRef" , "ORD"."U_BatchId" , "ORD"."U_DocumentKey" , "ORD"."U_NumIdentFE" , "ORD"."U_TipoIdentificacion" , "ORD"."U_EMA_numTransaccion_acumular" , "ORD"."U_EMA_Approval_Status" , "ORD"."U_EMA_numTransaccion_redimir" , "ORD"."U_TipoDocE" , "ORD"."U_CorreoFE" FROM  ORDR AS Ord;



--184-----------------------------------------------------------184--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_UDF_OWTQ_B1SLQuery" ( "DocEntry", "DocNum", "DocType", "CANCELED", "Handwrtten", "Printed", "DocStatus", "InvntSttus", "Transfered", "ObjType", "DocDate", "DocDueDate", "CardCode", "CardName", "Address", "NumAtCard", "VatPercent", "VatSum", "VatSumFC", "DiscPrcnt", "DiscSum", "DiscSumFC", "DocCur", "DocRate", "DocTotal", "DocTotalFC", "PaidToDate", "PaidFC", "GrosProfit", "GrosProfFC", "Ref1", "Ref2", "Comments", "JrnlMemo", "TransId", "ReceiptNum", "GroupNum", "DocTime", "SlpCode", "TrnspCode", "PartSupply", "Confirmed", "GrossBase", "ImportEnt", "CreateTran", "SummryType", "UpdInvnt", "UpdCardBal", "Instance", "Flags", "InvntDirec", "CntctCode", "ShowSCN", "FatherCard", "SysRate", "CurSource", "VatSumSy", "DiscSumSy", "DocTotalSy", "PaidSys", "FatherType", "GrosProfSy", "UpdateDate", "IsICT", "CreateDate", "Volume", "VolUnit", "Weight", "WeightUnit", "Series", "TaxDate", "Filler", "DataSource", "StampNum", "isCrin", "FinncPriod", "UserSign", "selfInv", "VatPaid", "VatPaidFC", "VatPaidSys", "UserSign2", "WddStatus", "draftKey", "TotalExpns", "TotalExpFC", "TotalExpSC", "DunnLevel", "Address2", "LogInstanc", "Exported", "StationID", "Indicator", "NetProc", "AqcsTax", "AqcsTaxFC", "AqcsTaxSC", "CashDiscPr", "CashDiscnt", "CashDiscFC", "CashDiscSC", "ShipToCode", "LicTradNum", "PaymentRef", "WTSum", "WTSumFC", "WTSumSC", "RoundDif", "RoundDifFC", "RoundDifSy", "CheckDigit", "Form1099", "Box1099", "submitted", "PoPrss", "Rounding", "RevisionPo", "Segment", "ReqDate", "CancelDate", "PickStatus", "Pick", "BlockDunn", "PeyMethod", "PayBlock", "PayBlckRef", "MaxDscn", "Reserve", "Max1099", "CntrlBnk", "PickRmrk", "ISRCodLine", "ExpAppl", "ExpApplFC", "ExpApplSC", "Project", "DeferrTax", "LetterNum", "FromDate", "ToDate", "WTApplied", "WTAppliedF", "BoeReserev", "AgentCode", "WTAppliedS", "EquVatSum", "EquVatSumF", "EquVatSumS", "Installmnt", "VATFirst", "NnSbAmnt", "NnSbAmntSC", "NbSbAmntFC", "ExepAmnt", "ExepAmntSC", "ExepAmntFC", "VatDate", "CorrExt", "CorrInv", "NCorrInv", "CEECFlag", "BaseAmnt", "BaseAmntSC", "BaseAmntFC", "CtlAccount", "BPLId", "BPLName", "VATRegNum", "TxInvRptNo", "TxInvRptDt", "KVVATCode", "WTDetails", "SumAbsId", "SumRptDate", "PIndicator", "ManualNum", "UseShpdGd", "BaseVtAt", "BaseVtAtSC", "BaseVtAtFC", "NnSbVAt", "NnSbVAtSC", "NbSbVAtFC", "ExptVAt", "ExptVAtSC", "ExptVAtFC", "LYPmtAt", "LYPmtAtSC", "LYPmtAtFC", "ExpAnSum", "ExpAnSys", "ExpAnFrgn", "DocSubType", "DpmStatus", "DpmAmnt", "DpmAmntSC", "DpmAmntFC", "DpmDrawn", "DpmPrcnt", "PaidSum", "PaidSumFc", "PaidSumSc", "FolioPref", "FolioNum", "DpmAppl", "DpmApplFc", "DpmApplSc", "LPgFolioN", "Header", "Footer", "Posted", "OwnerCode", "BPChCode", "BPChCntc", "PayToCode", "IsPaytoBnk", "BnkCntry", "BankCode", "BnkAccount", "BnkBranch", "isIns", "TrackNo", "VersionNum", "LangCode", "BPNameOW", "BillToOW", "ShipToOW", "RetInvoice", "ClsDate", "MInvNum", "MInvDate", "SeqCode", "Serial", "SeriesStr", "SubStr", "Model", "TaxOnExp", "TaxOnExpFc", "TaxOnExpSc", "TaxOnExAp", "TaxOnExApF", "TaxOnExApS", "LastPmnTyp", "LndCstNum", "UseCorrVat", "BlkCredMmo", "OpenForLaC", "Excised", "ExcRefDate", "ExcRmvTime", "SrvGpPrcnt", "DepositNum", "CertNum", "DutyStatus", "AutoCrtFlw", "FlwRefDate", "FlwRefNum", "VatJENum", "DpmVat", "DpmVatFc", "DpmVatSc", "DpmAppVat", "DpmAppVatF", "DpmAppVatS", "InsurOp347", "IgnRelDoc", "BuildDesc", "ResidenNum", "Checker", "Payee", "CopyNumber", "SSIExmpt", "PQTGrpSer", "PQTGrpNum", "PQTGrpHW", "ReopOriDoc", "ReopManCls", "DocManClsd", "ClosingOpt", "SpecDate", "Ordered", "NTSApprov", "NTSWebSite", "NTSeTaxNo", "NTSApprNo", "PayDuMonth", "ExtraMonth", "ExtraDays", "CdcOffset", "SignMsg", "SignDigest", "CertifNum", "KeyVersion", "EDocGenTyp", "ESeries", "EDocNum", "EDocExpFrm", "OnlineQuo", "POSEqNum", "POSManufSN", "POSCashN", "EDocStatus", "EDocCntnt", "EDocProces", "EDocErrCod", "EDocErrMsg", "EDocCancel", "EDocTest", "EDocPrefix", "CUP", "CIG", "DpmAsDscnt", "Attachment", "AtcEntry", "SupplCode", "GTSRlvnt", "BaseDisc", "BaseDiscSc", "BaseDiscFc", "BaseDiscPr", "CreateTS", "UpdateTS", "SrvTaxRule", "AnnInvDecR", "Supplier", "Releaser", "Receiver", "ToWhsCode", "AssetDate", "Requester", "ReqName", "Branch", "Department", "Email", "Notify", "ReqType", "OriginType", "IsReuseNum", "IsReuseNFN", "DocDlvry", "PaidDpm", "PaidDpmF", "PaidDpmS", "EnvTypeNFe", "AgrNo", "IsAlt", "AltBaseTyp", "AltBaseEnt", "AuthCode", "StDlvDate", "StDlvTime", "EndDlvDate", "EndDlvTime", "VclPlate", "ElCoStatus", "AtDocType", "ElCoMsg", "PrintSEPA", "FreeChrg", "FreeChrgFC", "FreeChrgSC", "NfeValue", "FiscDocNum", "RelatedTyp", "RelatedEnt", "CCDEntry", "NfePrntFo", "ZrdAbs", "POSRcptNo", "FoCTax", "FoCTaxFC", "FoCTaxSC", "TpCusPres", "ExcDocDate", "FoCFrght", "FoCFrghtFC", "FoCFrghtSC", "InterimTyp", "PTICode", "Letter", "FolNumFrom", "FolNumTo", "FolSeries", "SplitTax", "SplitTaxFC", "SplitTaxSC", "ToBinCode", "PriceMode", "PoDropPrss", "PermitNo", "MYFtype", "DocTaxID", "DateReport", "RepSection", "ExclTaxRep", "PosCashReg", "DmpTransID", "ECommerBP", "EComerGSTN", "Revision", "RevRefNo", "RevRefDate", "RevCreRefN", "RevCreRefD", "TaxInvNo", "FrmBpDate", "GSTTranTyp", "BaseType", "BaseEntry", "ComTrade", "UseBilAddr", "IssReason", "ComTradeRt", "SplitPmnt", "SOIWizId", "SelfPosted", "EnBnkAcct", "EncryptIV", "DPPStatus", "SAPPassprt", "EWBGenType", "CtActTax", "CtActTaxFC", "CtActTaxSC", "EDocType", "QRCodeSrc", "AggregDoc", "DataVers", "ShipState", "ShipPlace", "CustOffice", "FCI", "NnSbCuAmnt", "NnSbCuSC", "NnSbCuFC", "ExepCuAmnt", "ExepCuSC", "ExepCuFC", "AddLegIn", "LegTextF", "IndFinal", "DANFELgTxt", "PostPmntWT", "QRCodeSPGn", "FCEPmnMean", "ReqCode", "NotRel4MI", "Rel4PPTax", "U_POSFCOffline", "U_POSHCOffline", "U_POSLIdOffline", "U_ClaveFE", "U_Provincia", "U_Canton", "U_Distrito", "U_Barrio", "U_Direccion", "U_CLVS_POS_UniqueInvId", "U_DocDateOffline", "U_DocTimeOffline", "U_Online", "U_User", "U_ListNum", "U_FeNumProvRef", "U_BatchId", "U_DocumentKey", "U_NumIdentFE", "U_TipoIdentificacion", "U_EMA_numTransaccion_acumular", "U_EMA_Approval_Status", "U_EMA_numTransaccion_redimir", "U_TipoDocE", "U_CorreoFE" ) AS SELECT "ORD"."DocEntry" , "ORD"."DocNum" , "ORD"."DocType" , "ORD"."CANCELED" , "ORD"."Handwrtten" , "ORD"."Printed" , "ORD"."DocStatus" , "ORD"."InvntSttus" , "ORD"."Transfered" , "ORD"."ObjType" , "ORD"."DocDate" , "ORD"."DocDueDate" , "ORD"."CardCode" , "ORD"."CardName" , "ORD"."Address" , "ORD"."NumAtCard" , "ORD"."VatPercent" , "ORD"."VatSum" , "ORD"."VatSumFC" , "ORD"."DiscPrcnt" , "ORD"."DiscSum" , "ORD"."DiscSumFC" , "ORD"."DocCur" , "ORD"."DocRate" , "ORD"."DocTotal" , "ORD"."DocTotalFC" , "ORD"."PaidToDate" , "ORD"."PaidFC" , "ORD"."GrosProfit" , "ORD"."GrosProfFC" , "ORD"."Ref1" , "ORD"."Ref2" , "ORD"."Comments" , "ORD"."JrnlMemo" , "ORD"."TransId" , "ORD"."ReceiptNum" , "ORD"."GroupNum" , "ORD"."DocTime" , "ORD"."SlpCode" , "ORD"."TrnspCode" , "ORD"."PartSupply" , "ORD"."Confirmed" , "ORD"."GrossBase" , "ORD"."ImportEnt" , "ORD"."CreateTran" , "ORD"."SummryType" , "ORD"."UpdInvnt" , "ORD"."UpdCardBal" , "ORD"."Instance" , "ORD"."Flags" , "ORD"."InvntDirec" , "ORD"."CntctCode" , "ORD"."ShowSCN" , "ORD"."FatherCard" , "ORD"."SysRate" , "ORD"."CurSource" , "ORD"."VatSumSy" , "ORD"."DiscSumSy" , "ORD"."DocTotalSy" , "ORD"."PaidSys" , "ORD"."FatherType" , "ORD"."GrosProfSy" , "ORD"."UpdateDate" , "ORD"."IsICT" , "ORD"."CreateDate" , "ORD"."Volume" , "ORD"."VolUnit" , "ORD"."Weight" , "ORD"."WeightUnit" , "ORD"."Series" , "ORD"."TaxDate" , "ORD"."Filler" , "ORD"."DataSource" , "ORD"."StampNum" , "ORD"."isCrin" , "ORD"."FinncPriod" , "ORD"."UserSign" , "ORD"."selfInv" , "ORD"."VatPaid" , "ORD"."VatPaidFC" , "ORD"."VatPaidSys" , "ORD"."UserSign2" , "ORD"."WddStatus" , "ORD"."draftKey" , "ORD"."TotalExpns" , "ORD"."TotalExpFC" , "ORD"."TotalExpSC" , "ORD"."DunnLevel" , "ORD"."Address2" , "ORD"."LogInstanc" , "ORD"."Exported" , "ORD"."StationID" , "ORD"."Indicator" , "ORD"."NetProc" , "ORD"."AqcsTax" , "ORD"."AqcsTaxFC" , "ORD"."AqcsTaxSC" , "ORD"."CashDiscPr" , "ORD"."CashDiscnt" , "ORD"."CashDiscFC" , "ORD"."CashDiscSC" , "ORD"."ShipToCode" , "ORD"."LicTradNum" , "ORD"."PaymentRef" , "ORD"."WTSum" , "ORD"."WTSumFC" , "ORD"."WTSumSC" , "ORD"."RoundDif" , "ORD"."RoundDifFC" , "ORD"."RoundDifSy" , "ORD"."CheckDigit" , "ORD"."Form1099" , "ORD"."Box1099" , "ORD"."submitted" , "ORD"."PoPrss" , "ORD"."Rounding" , "ORD"."RevisionPo" , "ORD"."Segment" , "ORD"."ReqDate" , "ORD"."CancelDate" , "ORD"."PickStatus" , "ORD"."Pick" , "ORD"."BlockDunn" , "ORD"."PeyMethod" , "ORD"."PayBlock" , "ORD"."PayBlckRef" , "ORD"."MaxDscn" , "ORD"."Reserve" , "ORD"."Max1099" , "ORD"."CntrlBnk" , "ORD"."PickRmrk" , "ORD"."ISRCodLine" , "ORD"."ExpAppl" , "ORD"."ExpApplFC" , "ORD"."ExpApplSC" , "ORD"."Project" , "ORD"."DeferrTax" , "ORD"."LetterNum" , "ORD"."FromDate" , "ORD"."ToDate" , "ORD"."WTApplied" , "ORD"."WTAppliedF" , "ORD"."BoeReserev" , "ORD"."AgentCode" , "ORD"."WTAppliedS" , "ORD"."EquVatSum" , "ORD"."EquVatSumF" , "ORD"."EquVatSumS" , "ORD"."Installmnt" , "ORD"."VATFirst" , "ORD"."NnSbAmnt" , "ORD"."NnSbAmntSC" , "ORD"."NbSbAmntFC" , "ORD"."ExepAmnt" , "ORD"."ExepAmntSC" , "ORD"."ExepAmntFC" , "ORD"."VatDate" , "ORD"."CorrExt" , "ORD"."CorrInv" , "ORD"."NCorrInv" , "ORD"."CEECFlag" , "ORD"."BaseAmnt" , "ORD"."BaseAmntSC" , "ORD"."BaseAmntFC" , "ORD"."CtlAccount" , "ORD"."BPLId" , "ORD"."BPLName" , "ORD"."VATRegNum" , "ORD"."TxInvRptNo" , "ORD"."TxInvRptDt" , "ORD"."KVVATCode" , "ORD"."WTDetails" , "ORD"."SumAbsId" , "ORD"."SumRptDate" , "ORD"."PIndicator" , "ORD"."ManualNum" , "ORD"."UseShpdGd" , "ORD"."BaseVtAt" , "ORD"."BaseVtAtSC" , "ORD"."BaseVtAtFC" , "ORD"."NnSbVAt" , "ORD"."NnSbVAtSC" , "ORD"."NbSbVAtFC" , "ORD"."ExptVAt" , "ORD"."ExptVAtSC" , "ORD"."ExptVAtFC" , "ORD"."LYPmtAt" , "ORD"."LYPmtAtSC" , "ORD"."LYPmtAtFC" , "ORD"."ExpAnSum" , "ORD"."ExpAnSys" , "ORD"."ExpAnFrgn" , "ORD"."DocSubType" , "ORD"."DpmStatus" , "ORD"."DpmAmnt" , "ORD"."DpmAmntSC" , "ORD"."DpmAmntFC" , "ORD"."DpmDrawn" , "ORD"."DpmPrcnt" , "ORD"."PaidSum" , "ORD"."PaidSumFc" , "ORD"."PaidSumSc" , "ORD"."FolioPref" , "ORD"."FolioNum" , "ORD"."DpmAppl" , "ORD"."DpmApplFc" , "ORD"."DpmApplSc" , "ORD"."LPgFolioN" , "ORD"."Header" , "ORD"."Footer" , "ORD"."Posted" , "ORD"."OwnerCode" , "ORD"."BPChCode" , "ORD"."BPChCntc" , "ORD"."PayToCode" , "ORD"."IsPaytoBnk" , "ORD"."BnkCntry" , "ORD"."BankCode" , "ORD"."BnkAccount" , "ORD"."BnkBranch" , "ORD"."isIns" , "ORD"."TrackNo" , "ORD"."VersionNum" , "ORD"."LangCode" , "ORD"."BPNameOW" , "ORD"."BillToOW" , "ORD"."ShipToOW" , "ORD"."RetInvoice" , "ORD"."ClsDate" , "ORD"."MInvNum" , "ORD"."MInvDate" , "ORD"."SeqCode" , "ORD"."Serial" , "ORD"."SeriesStr" , "ORD"."SubStr" , "ORD"."Model" , "ORD"."TaxOnExp" , "ORD"."TaxOnExpFc" , "ORD"."TaxOnExpSc" , "ORD"."TaxOnExAp" , "ORD"."TaxOnExApF" , "ORD"."TaxOnExApS" , "ORD"."LastPmnTyp" , "ORD"."LndCstNum" , "ORD"."UseCorrVat" , "ORD"."BlkCredMmo" , "ORD"."OpenForLaC" , "ORD"."Excised" , "ORD"."ExcRefDate" , "ORD"."ExcRmvTime" , "ORD"."SrvGpPrcnt" , "ORD"."DepositNum" , "ORD"."CertNum" , "ORD"."DutyStatus" , "ORD"."AutoCrtFlw" , "ORD"."FlwRefDate" , "ORD"."FlwRefNum" , "ORD"."VatJENum" , "ORD"."DpmVat" , "ORD"."DpmVatFc" , "ORD"."DpmVatSc" , "ORD"."DpmAppVat" , "ORD"."DpmAppVatF" , "ORD"."DpmAppVatS" , "ORD"."InsurOp347" , "ORD"."IgnRelDoc" , "ORD"."BuildDesc" , "ORD"."ResidenNum" , "ORD"."Checker" , "ORD"."Payee" , "ORD"."CopyNumber" , "ORD"."SSIExmpt" , "ORD"."PQTGrpSer" , "ORD"."PQTGrpNum" , "ORD"."PQTGrpHW" , "ORD"."ReopOriDoc" , "ORD"."ReopManCls" , "ORD"."DocManClsd" , "ORD"."ClosingOpt" , "ORD"."SpecDate" , "ORD"."Ordered" , "ORD"."NTSApprov" , "ORD"."NTSWebSite" , "ORD"."NTSeTaxNo" , "ORD"."NTSApprNo" , "ORD"."PayDuMonth" , "ORD"."ExtraMonth" , "ORD"."ExtraDays" , "ORD"."CdcOffset" , "ORD"."SignMsg" , "ORD"."SignDigest" , "ORD"."CertifNum" , "ORD"."KeyVersion" , "ORD"."EDocGenTyp" , "ORD"."ESeries" , "ORD"."EDocNum" , "ORD"."EDocExpFrm" , "ORD"."OnlineQuo" , "ORD"."POSEqNum" , "ORD"."POSManufSN" , "ORD"."POSCashN" , "ORD"."EDocStatus" , "ORD"."EDocCntnt" , "ORD"."EDocProces" , "ORD"."EDocErrCod" , "ORD"."EDocErrMsg" , "ORD"."EDocCancel" , "ORD"."EDocTest" , "ORD"."EDocPrefix" , "ORD"."CUP" , "ORD"."CIG" , "ORD"."DpmAsDscnt" , "ORD"."Attachment" , "ORD"."AtcEntry" , "ORD"."SupplCode" , "ORD"."GTSRlvnt" , "ORD"."BaseDisc" , "ORD"."BaseDiscSc" , "ORD"."BaseDiscFc" , "ORD"."BaseDiscPr" , "ORD"."CreateTS" , "ORD"."UpdateTS" , "ORD"."SrvTaxRule" , "ORD"."AnnInvDecR" , "ORD"."Supplier" , "ORD"."Releaser" , "ORD"."Receiver" , "ORD"."ToWhsCode" , "ORD"."AssetDate" , "ORD"."Requester" , "ORD"."ReqName" , "ORD"."Branch" , "ORD"."Department" , "ORD"."Email" , "ORD"."Notify" , "ORD"."ReqType" , "ORD"."OriginType" , "ORD"."IsReuseNum" , "ORD"."IsReuseNFN" , "ORD"."DocDlvry" , "ORD"."PaidDpm" , "ORD"."PaidDpmF" , "ORD"."PaidDpmS" , "ORD"."EnvTypeNFe" , "ORD"."AgrNo" , "ORD"."IsAlt" , "ORD"."AltBaseTyp" , "ORD"."AltBaseEnt" , "ORD"."AuthCode" , "ORD"."StDlvDate" , "ORD"."StDlvTime" , "ORD"."EndDlvDate" , "ORD"."EndDlvTime" , "ORD"."VclPlate" , "ORD"."ElCoStatus" , "ORD"."AtDocType" , "ORD"."ElCoMsg" , "ORD"."PrintSEPA" , "ORD"."FreeChrg" , "ORD"."FreeChrgFC" , "ORD"."FreeChrgSC" , "ORD"."NfeValue" , "ORD"."FiscDocNum" , "ORD"."RelatedTyp" , "ORD"."RelatedEnt" , "ORD"."CCDEntry" , "ORD"."NfePrntFo" , "ORD"."ZrdAbs" , "ORD"."POSRcptNo" , "ORD"."FoCTax" , "ORD"."FoCTaxFC" , "ORD"."FoCTaxSC" , "ORD"."TpCusPres" , "ORD"."ExcDocDate" , "ORD"."FoCFrght" , "ORD"."FoCFrghtFC" , "ORD"."FoCFrghtSC" , "ORD"."InterimTyp" , "ORD"."PTICode" , "ORD"."Letter" , "ORD"."FolNumFrom" , "ORD"."FolNumTo" , "ORD"."FolSeries" , "ORD"."SplitTax" , "ORD"."SplitTaxFC" , "ORD"."SplitTaxSC" , "ORD"."ToBinCode" , "ORD"."PriceMode" , "ORD"."PoDropPrss" , "ORD"."PermitNo" , "ORD"."MYFtype" , "ORD"."DocTaxID" , "ORD"."DateReport" , "ORD"."RepSection" , "ORD"."ExclTaxRep" , "ORD"."PosCashReg" , "ORD"."DmpTransID" , "ORD"."ECommerBP" , "ORD"."EComerGSTN" , "ORD"."Revision" , "ORD"."RevRefNo" , "ORD"."RevRefDate" , "ORD"."RevCreRefN" , "ORD"."RevCreRefD" , "ORD"."TaxInvNo" , "ORD"."FrmBpDate" , "ORD"."GSTTranTyp" , "ORD"."BaseType" , "ORD"."BaseEntry" , "ORD"."ComTrade" , "ORD"."UseBilAddr" , "ORD"."IssReason" , "ORD"."ComTradeRt" , "ORD"."SplitPmnt" , "ORD"."SOIWizId" , "ORD"."SelfPosted" , "ORD"."EnBnkAcct" , "ORD"."EncryptIV" , "ORD"."DPPStatus" , "ORD"."SAPPassprt" , "ORD"."EWBGenType" , "ORD"."CtActTax" , "ORD"."CtActTaxFC" , "ORD"."CtActTaxSC" , "ORD"."EDocType" , "ORD"."QRCodeSrc" , "ORD"."AggregDoc" , "ORD"."DataVers" , "ORD"."ShipState" , "ORD"."ShipPlace" , "ORD"."CustOffice" , "ORD"."FCI" , "ORD"."NnSbCuAmnt" , "ORD"."NnSbCuSC" , "ORD"."NnSbCuFC" , "ORD"."ExepCuAmnt" , "ORD"."ExepCuSC" , "ORD"."ExepCuFC" , "ORD"."AddLegIn" , "ORD"."LegTextF" , "ORD"."IndFinal" , "ORD"."DANFELgTxt" , "ORD"."PostPmntWT" , "ORD"."QRCodeSPGn" , "ORD"."FCEPmnMean" , "ORD"."ReqCode" , "ORD"."NotRel4MI" , "ORD"."Rel4PPTax" , "ORD"."U_POSFCOffline" , "ORD"."U_POSHCOffline" , "ORD"."U_POSLIdOffline" , "ORD"."U_ClaveFE" , "ORD"."U_Provincia" , "ORD"."U_Canton" , "ORD"."U_Distrito" , "ORD"."U_Barrio" , "ORD"."U_Direccion" , "ORD"."U_CLVS_POS_UniqueInvId" , "ORD"."U_DocDateOffline" , "ORD"."U_DocTimeOffline" , "ORD"."U_Online" , "ORD"."U_User" , "ORD"."U_ListNum" , "ORD"."U_FeNumProvRef" , "ORD"."U_BatchId" , "ORD"."U_DocumentKey" , "ORD"."U_NumIdentFE" , "ORD"."U_TipoIdentificacion" , "ORD"."U_EMA_numTransaccion_acumular" , "ORD"."U_EMA_Approval_Status" , "ORD"."U_EMA_numTransaccion_redimir" , "ORD"."U_TipoDocE" , "ORD"."U_CorreoFE" FROM OWTQ AS Ord;



--185-----------------------------------------------------------185--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_UDF_PCH1_B1SLQuery" ( "DocEntry", "LineNum", "TargetType", "TrgetEntry", "BaseRef", "BaseType", "BaseEntry", "BaseLine", "LineStatus", "ItemCode", "Dscription", "Quantity", "ShipDate", "OpenQty", "Price", "Currency", "Rate", "DiscPrcnt", "LineTotal", "TotalFrgn", "OpenSum", "OpenSumFC", "VendorNum", "SerialNum", "WhsCode", "SlpCode", "Commission", "TreeType", "AcctCode", "TaxStatus", "GrossBuyPr", "PriceBefDi", "DocDate", "Flags", "OpenCreQty", "UseBaseUn", "SubCatNum", "BaseCard", "TotalSumSy", "OpenSumSys", "InvntSttus", "OcrCode", "Project", "CodeBars", "VatPrcnt", "VatGroup", "PriceAfVAT", "Height1", "Hght1Unit", "Height2", "Hght2Unit", "Width1", "Wdth1Unit", "Width2", "Wdth2Unit", "Length1", "Len1Unit", "length2", "Len2Unit", "Volume", "VolUnit", "Weight1", "Wght1Unit", "Weight2", "Wght2Unit", "Factor1", "Factor2", "Factor3", "Factor4", "PackQty", "UpdInvntry", "BaseDocNum", "BaseAtCard", "SWW", "VatSum", "VatSumFrgn", "VatSumSy", "FinncPriod", "ObjType", "LogInstanc", "BlockNum", "ImportLog", "DedVatSum", "DedVatSumF", "DedVatSumS", "IsAqcuistn", "DistribSum", "DstrbSumFC", "DstrbSumSC", "GrssProfit", "GrssProfSC", "GrssProfFC", "VisOrder", "INMPrice", "PoTrgNum", "PoTrgEntry", "DropShip", "PoLineNum", "Address", "TaxCode", "TaxType", "OrigItem", "BackOrdr", "FreeTxt", "PickStatus", "PickOty", "PickIdNo", "TrnsCode", "VatAppld", "VatAppldFC", "VatAppldSC", "BaseQty", "BaseOpnQty", "VatDscntPr", "WtLiable", "DeferrTax", "EquVatPer", "EquVatSum", "EquVatSumF", "EquVatSumS", "LineVat", "LineVatlF", "LineVatS", "unitMsr", "NumPerMsr", "CEECFlag", "ToStock", "ToDiff", "ExciseAmt", "TaxPerUnit", "TotInclTax", "CountryOrg", "StckDstSum", "ReleasQtty", "LineType", "TranType", "Text", "OwnerCode", "StockPrice", "ConsumeFCT", "LstByDsSum", "StckINMPr", "LstBINMPr", "StckDstFc", "StckDstSc", "LstByDsFc", "LstByDsSc", "StockSum", "StockSumFc", "StockSumSc", "StckSumApp", "StckAppFc", "StckAppSc", "ShipToCode", "ShipToDesc", "StckAppD", "StckAppDFC", "StckAppDSC", "BasePrice", "GTotal", "GTotalFC", "GTotalSC", "DistribExp", "DescOW", "DetailsOW", "GrossBase", "VatWoDpm", "VatWoDpmFc", "VatWoDpmSc", "CFOPCode", "CSTCode", "Usage", "TaxOnly", "WtCalced", "QtyToShip", "DelivrdQty", "OrderedQty", "CogsOcrCod", "CiOppLineN", "CogsAcct", "ChgAsmBoMW", "ActDelDate", "OcrCode2", "OcrCode3", "OcrCode4", "OcrCode5", "TaxDistSum", "TaxDistSFC", "TaxDistSSC", "PostTax", "Excisable", "AssblValue", "RG23APart1", "RG23APart2", "RG23CPart1", "RG23CPart2", "CogsOcrCo2", "CogsOcrCo3", "CogsOcrCo4", "CogsOcrCo5", "LnExcised", "LocCode", "StockValue", "GPTtlBasPr", "unitMsr2", "NumPerMsr2", "SpecPrice", "CSTfIPI", "CSTfPIS", "CSTfCOFINS", "ExLineNo", "isSrvCall", "PQTReqQty", "PQTReqDate", "PcDocType", "PcQuantity", "LinManClsd", "VatGrpSrc", "NoInvtryMv", "ActBaseEnt", "ActBaseLn", "ActBaseNum", "OpenRtnQty", "AgrNo", "AgrLnNum", "CredOrigin", "Surpluses", "DefBreak", "Shortages", "UomEntry", "UomEntry2", "UomCode", "UomCode2", "FromWhsCod", "NeedQty", "PartRetire", "RetireQty", "RetireAPC", "RetirAPCFC", "RetirAPCSC", "InvQty", "OpenInvQty", "EnSetCost", "RetCost", "Incoterms", "TransMod", "LineVendor", "DistribIS", "ISDistrb", "ISDistrbFC", "ISDistrbSC", "IsByPrdct", "ItemType", "PriceEdit", "PrntLnNum", "LinePoPrss", "FreeChrgBP", "TaxRelev", "LegalText", "ThirdParty", "LicTradNum", "InvQtyOnly", "UnencReasn", "ShipFromCo", "ShipFromDe", "FisrtBin", "AllocBinC", "ExpType", "ExpUUID", "ExpOpType", "DIOTNat", "MYFtype", "GPBefDisc", "ReturnRsn", "ReturnAct", "StgSeqNum", "StgEntry", "StgDesc", "ItmTaxType", "SacEntry", "NCMCode", "HsnEntry", "OriBAbsEnt", "OriBLinNum", "OriBDocTyp", "IsPrscGood", "IsCstmAct", "EncryptIV", "ExtTaxRate", "ExtTaxSum", "TaxAmtSrc", "ExtTaxSumF", "ExtTaxSumS", "StdItemId", "CommClass", "VatExEntry", "VatExLN", "NatOfTrans", "ISDtCryImp", "ISDtRgnImp", "ISOrCryExp", "ISOrRgnExp", "NVECode", "PoNum", "PoItmNum", "IndEscala", "CESTCode", "CtrSealQty", "CNJPMan", "UFFiscBene", "CUSplit", "LegalTIMD", "LegalTTCA", "LegalTW", "LegalTCD", "RevCharge", "ListNum", "U_DescriptionItemXml", "U_UDF_CodItemXML", "U_UDF_DescItemXML" ) AS SELECT "DocEntry" , "LineNum" , "TargetType" , "TrgetEntry" , "BaseRef" , "BaseType" , "BaseEntry" , "BaseLine" , "LineStatus" , "ItemCode" , "Dscription" , "Quantity" , "ShipDate" , "OpenQty" , "Price" , "Currency" , "Rate" , "DiscPrcnt" , "LineTotal" , "TotalFrgn" , "OpenSum" , "OpenSumFC" , "VendorNum" , "SerialNum" , "WhsCode" , "SlpCode" , "Commission" , "TreeType" , "AcctCode" , "TaxStatus" , "GrossBuyPr" , "PriceBefDi" , "DocDate" , "Flags" , "OpenCreQty" , "UseBaseUn" , "SubCatNum" , "BaseCard" , "TotalSumSy" , "OpenSumSys" , "InvntSttus" , "OcrCode" , "Project" , "CodeBars" , "VatPrcnt" , "VatGroup" , "PriceAfVAT" , "Height1" , "Hght1Unit" , "Height2" , "Hght2Unit" , "Width1" , "Wdth1Unit" , "Width2" , "Wdth2Unit" , "Length1" , "Len1Unit" , "length2" , "Len2Unit" , "Volume" , "VolUnit" , "Weight1" , "Wght1Unit" , "Weight2" , "Wght2Unit" , "Factor1" , "Factor2" , "Factor3" , "Factor4" , "PackQty" , "UpdInvntry" , "BaseDocNum" , "BaseAtCard" , "SWW" , "VatSum" , "VatSumFrgn" , "VatSumSy" , "FinncPriod" , "ObjType" , "LogInstanc" , "BlockNum" , "ImportLog" , "DedVatSum" , "DedVatSumF" , "DedVatSumS" , "IsAqcuistn" , "DistribSum" , "DstrbSumFC" , "DstrbSumSC" , "GrssProfit" , "GrssProfSC" , "GrssProfFC" , "VisOrder" , "INMPrice" , "PoTrgNum" , "PoTrgEntry" , "DropShip" , "PoLineNum" , "Address" , "TaxCode" , "TaxType" , "OrigItem" , "BackOrdr" , "FreeTxt" , "PickStatus" , "PickOty" , "PickIdNo" , "TrnsCode" , "VatAppld" , "VatAppldFC" , "VatAppldSC" , "BaseQty" , "BaseOpnQty" , "VatDscntPr" , "WtLiable" , "DeferrTax" , "EquVatPer" , "EquVatSum" , "EquVatSumF" , "EquVatSumS" , "LineVat" , "LineVatlF" , "LineVatS" , "unitMsr" , "NumPerMsr" , "CEECFlag" , "ToStock" , "ToDiff" , "ExciseAmt" , "TaxPerUnit" , "TotInclTax" , "CountryOrg" , "StckDstSum" , "ReleasQtty" , "LineType" , "TranType" , "Text" , "OwnerCode" , "StockPrice" , "ConsumeFCT" , "LstByDsSum" , "StckINMPr" , "LstBINMPr" , "StckDstFc" , "StckDstSc" , "LstByDsFc" , "LstByDsSc" , "StockSum" , "StockSumFc" , "StockSumSc" , "StckSumApp" , "StckAppFc" , "StckAppSc" , "ShipToCode" , "ShipToDesc" , "StckAppD" , "StckAppDFC" , "StckAppDSC" , "BasePrice" , "GTotal" , "GTotalFC" , "GTotalSC" , "DistribExp" , "DescOW" , "DetailsOW" , "GrossBase" , "VatWoDpm" , "VatWoDpmFc" , "VatWoDpmSc" , "CFOPCode" , "CSTCode" , "Usage" , "TaxOnly" , "WtCalced" , "QtyToShip" , "DelivrdQty" , "OrderedQty" , "CogsOcrCod" , "CiOppLineN" , "CogsAcct" , "ChgAsmBoMW" , "ActDelDate" , "OcrCode2" , "OcrCode3" , "OcrCode4" , "OcrCode5" , "TaxDistSum" , "TaxDistSFC" , "TaxDistSSC" , "PostTax" , "Excisable" , "AssblValue" , "RG23APart1" , "RG23APart2" , "RG23CPart1" , "RG23CPart2" , "CogsOcrCo2" , "CogsOcrCo3" , "CogsOcrCo4" , "CogsOcrCo5" , "LnExcised" , "LocCode" , "StockValue" , "GPTtlBasPr" , "unitMsr2" , "NumPerMsr2" , "SpecPrice" , "CSTfIPI" , "CSTfPIS" , "CSTfCOFINS" , "ExLineNo" , "isSrvCall" , "PQTReqQty" , "PQTReqDate" , "PcDocType" , "PcQuantity" , "LinManClsd" , "VatGrpSrc" , "NoInvtryMv" , "ActBaseEnt" , "ActBaseLn" , "ActBaseNum" , "OpenRtnQty" , "AgrNo" , "AgrLnNum" , "CredOrigin" , "Surpluses" , "DefBreak" , "Shortages" , "UomEntry" , "UomEntry2" , "UomCode" , "UomCode2" , "FromWhsCod" , "NeedQty" , "PartRetire" , "RetireQty" , "RetireAPC" , "RetirAPCFC" , "RetirAPCSC" , "InvQty" , "OpenInvQty" , "EnSetCost" , "RetCost" , "Incoterms" , "TransMod" , "LineVendor" , "DistribIS" , "ISDistrb" , "ISDistrbFC" , "ISDistrbSC" , "IsByPrdct" , "ItemType" , "PriceEdit" , "PrntLnNum" , "LinePoPrss" , "FreeChrgBP" , "TaxRelev" , "LegalText" , "ThirdParty" , "LicTradNum" , "InvQtyOnly" , "UnencReasn" , "ShipFromCo" , "ShipFromDe" , "FisrtBin" , "AllocBinC" , "ExpType" , "ExpUUID" , "ExpOpType" , "DIOTNat" , "MYFtype" , "GPBefDisc" , "ReturnRsn" , "ReturnAct" , "StgSeqNum" , "StgEntry" , "StgDesc" , "ItmTaxType" , "SacEntry" , "NCMCode" , "HsnEntry" , "OriBAbsEnt" , "OriBLinNum" , "OriBDocTyp" , "IsPrscGood" , "IsCstmAct" , "EncryptIV" , "ExtTaxRate" , "ExtTaxSum" , "TaxAmtSrc" , "ExtTaxSumF" , "ExtTaxSumS" , "StdItemId" , "CommClass" , "VatExEntry" , "VatExLN" , "NatOfTrans" , "ISDtCryImp" , "ISDtRgnImp" , "ISOrCryExp" , "ISOrRgnExp" , "NVECode" , "PoNum" , "PoItmNum" , "IndEscala" , "CESTCode" , "CtrSealQty" , "CNJPMan" , "UFFiscBene" , "CUSplit" , "LegalTIMD" , "LegalTTCA" , "LegalTW" , "LegalTCD" , "RevCharge" , "ListNum" , "U_DescriptionItemXml" , "U_UDF_CodItemXML" , "U_UDF_DescItemXML" FROM PCH1;



--186-----------------------------------------------------------186--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_UDF_PDN1_B1SLQuery" ( "DocEntry", "LineNum", "TargetType", "TrgetEntry", "BaseRef", "BaseType", "BaseEntry", "BaseLine", "LineStatus", "ItemCode", "Dscription", "Quantity", "ShipDate", "OpenQty", "Price", "Currency", "Rate", "DiscPrcnt", "LineTotal", "TotalFrgn", "OpenSum", "OpenSumFC", "VendorNum", "SerialNum", "WhsCode", "SlpCode", "Commission", "TreeType", "AcctCode", "TaxStatus", "GrossBuyPr", "PriceBefDi", "DocDate", "Flags", "OpenCreQty", "UseBaseUn", "SubCatNum", "BaseCard", "TotalSumSy", "OpenSumSys", "InvntSttus", "OcrCode", "Project", "CodeBars", "VatPrcnt", "VatGroup", "PriceAfVAT", "Height1", "Hght1Unit", "Height2", "Hght2Unit", "Width1", "Wdth1Unit", "Width2", "Wdth2Unit", "Length1", "Len1Unit", "length2", "Len2Unit", "Volume", "VolUnit", "Weight1", "Wght1Unit", "Weight2", "Wght2Unit", "Factor1", "Factor2", "Factor3", "Factor4", "PackQty", "UpdInvntry", "BaseDocNum", "BaseAtCard", "SWW", "VatSum", "VatSumFrgn", "VatSumSy", "FinncPriod", "ObjType", "LogInstanc", "BlockNum", "ImportLog", "DedVatSum", "DedVatSumF", "DedVatSumS", "IsAqcuistn", "DistribSum", "DstrbSumFC", "DstrbSumSC", "GrssProfit", "GrssProfSC", "GrssProfFC", "VisOrder", "INMPrice", "PoTrgNum", "PoTrgEntry", "DropShip", "PoLineNum", "Address", "TaxCode", "TaxType", "OrigItem", "BackOrdr", "FreeTxt", "PickStatus", "PickOty", "PickIdNo", "TrnsCode", "VatAppld", "VatAppldFC", "VatAppldSC", "BaseQty", "BaseOpnQty", "VatDscntPr", "WtLiable", "DeferrTax", "EquVatPer", "EquVatSum", "EquVatSumF", "EquVatSumS", "LineVat", "LineVatlF", "LineVatS", "unitMsr", "NumPerMsr", "CEECFlag", "ToStock", "ToDiff", "ExciseAmt", "TaxPerUnit", "TotInclTax", "CountryOrg", "StckDstSum", "ReleasQtty", "LineType", "TranType", "Text", "OwnerCode", "StockPrice", "ConsumeFCT", "LstByDsSum", "StckINMPr", "LstBINMPr", "StckDstFc", "StckDstSc", "LstByDsFc", "LstByDsSc", "StockSum", "StockSumFc", "StockSumSc", "StckSumApp", "StckAppFc", "StckAppSc", "ShipToCode", "ShipToDesc", "StckAppD", "StckAppDFC", "StckAppDSC", "BasePrice", "GTotal", "GTotalFC", "GTotalSC", "DistribExp", "DescOW", "DetailsOW", "GrossBase", "VatWoDpm", "VatWoDpmFc", "VatWoDpmSc", "CFOPCode", "CSTCode", "Usage", "TaxOnly", "WtCalced", "QtyToShip", "DelivrdQty", "OrderedQty", "CogsOcrCod", "CiOppLineN", "CogsAcct", "ChgAsmBoMW", "ActDelDate", "OcrCode2", "OcrCode3", "OcrCode4", "OcrCode5", "TaxDistSum", "TaxDistSFC", "TaxDistSSC", "PostTax", "Excisable", "AssblValue", "RG23APart1", "RG23APart2", "RG23CPart1", "RG23CPart2", "CogsOcrCo2", "CogsOcrCo3", "CogsOcrCo4", "CogsOcrCo5", "LnExcised", "LocCode", "StockValue", "GPTtlBasPr", "unitMsr2", "NumPerMsr2", "SpecPrice", "CSTfIPI", "CSTfPIS", "CSTfCOFINS", "ExLineNo", "isSrvCall", "PQTReqQty", "PQTReqDate", "PcDocType", "PcQuantity", "LinManClsd", "VatGrpSrc", "NoInvtryMv", "ActBaseEnt", "ActBaseLn", "ActBaseNum", "OpenRtnQty", "AgrNo", "AgrLnNum", "CredOrigin", "Surpluses", "DefBreak", "Shortages", "UomEntry", "UomEntry2", "UomCode", "UomCode2", "FromWhsCod", "NeedQty", "PartRetire", "RetireQty", "RetireAPC", "RetirAPCFC", "RetirAPCSC", "InvQty", "OpenInvQty", "EnSetCost", "RetCost", "Incoterms", "TransMod", "LineVendor", "DistribIS", "ISDistrb", "ISDistrbFC", "ISDistrbSC", "IsByPrdct", "ItemType", "PriceEdit", "PrntLnNum", "LinePoPrss", "FreeChrgBP", "TaxRelev", "LegalText", "ThirdParty", "LicTradNum", "InvQtyOnly", "UnencReasn", "ShipFromCo", "ShipFromDe", "FisrtBin", "AllocBinC", "ExpType", "ExpUUID", "ExpOpType", "DIOTNat", "MYFtype", "GPBefDisc", "ReturnRsn", "ReturnAct", "StgSeqNum", "StgEntry", "StgDesc", "ItmTaxType", "SacEntry", "NCMCode", "HsnEntry", "OriBAbsEnt", "OriBLinNum", "OriBDocTyp", "IsPrscGood", "IsCstmAct", "EncryptIV", "ExtTaxRate", "ExtTaxSum", "TaxAmtSrc", "ExtTaxSumF", "ExtTaxSumS", "StdItemId", "CommClass", "VatExEntry", "VatExLN", "NatOfTrans", "ISDtCryImp", "ISDtRgnImp", "ISOrCryExp", "ISOrRgnExp", "NVECode", "PoNum", "PoItmNum", "IndEscala", "CESTCode", "CtrSealQty", "CNJPMan", "UFFiscBene", "CUSplit", "LegalTIMD", "LegalTTCA", "LegalTW", "LegalTCD", "RevCharge", "ListNum", "U_DescriptionItemXml", "U_UDF_CodItemXML", "U_UDF_DescItemXML" ) AS SELECT "DocEntry" , "LineNum" , "TargetType" , "TrgetEntry" , "BaseRef" , "BaseType" , "BaseEntry" , "BaseLine" , "LineStatus" , "ItemCode" , "Dscription" , "Quantity" , "ShipDate" , "OpenQty" , "Price" , "Currency" , "Rate" , "DiscPrcnt" , "LineTotal" , "TotalFrgn" , "OpenSum" , "OpenSumFC" , "VendorNum" , "SerialNum" , "WhsCode" , "SlpCode" , "Commission" , "TreeType" , "AcctCode" , "TaxStatus" , "GrossBuyPr" , "PriceBefDi" , "DocDate" , "Flags" , "OpenCreQty" , "UseBaseUn" , "SubCatNum" , "BaseCard" , "TotalSumSy" , "OpenSumSys" , "InvntSttus" , "OcrCode" , "Project" , "CodeBars" , "VatPrcnt" , "VatGroup" , "PriceAfVAT" , "Height1" , "Hght1Unit" , "Height2" , "Hght2Unit" , "Width1" , "Wdth1Unit" , "Width2" , "Wdth2Unit" , "Length1" , "Len1Unit" , "length2" , "Len2Unit" , "Volume" , "VolUnit" , "Weight1" , "Wght1Unit" , "Weight2" , "Wght2Unit" , "Factor1" , "Factor2" , "Factor3" , "Factor4" , "PackQty" , "UpdInvntry" , "BaseDocNum" , "BaseAtCard" , "SWW" , "VatSum" , "VatSumFrgn" , "VatSumSy" , "FinncPriod" , "ObjType" , "LogInstanc" , "BlockNum" , "ImportLog" , "DedVatSum" , "DedVatSumF" , "DedVatSumS" , "IsAqcuistn" , "DistribSum" , "DstrbSumFC" , "DstrbSumSC" , "GrssProfit" , "GrssProfSC" , "GrssProfFC" , "VisOrder" , "INMPrice" , "PoTrgNum" , "PoTrgEntry" , "DropShip" , "PoLineNum" , "Address" , "TaxCode" , "TaxType" , "OrigItem" , "BackOrdr" , "FreeTxt" , "PickStatus" , "PickOty" , "PickIdNo" , "TrnsCode" , "VatAppld" , "VatAppldFC" , "VatAppldSC" , "BaseQty" , "BaseOpnQty" , "VatDscntPr" , "WtLiable" , "DeferrTax" , "EquVatPer" , "EquVatSum" , "EquVatSumF" , "EquVatSumS" , "LineVat" , "LineVatlF" , "LineVatS" , "unitMsr" , "NumPerMsr" , "CEECFlag" , "ToStock" , "ToDiff" , "ExciseAmt" , "TaxPerUnit" , "TotInclTax" , "CountryOrg" , "StckDstSum" , "ReleasQtty" , "LineType" , "TranType" , "Text" , "OwnerCode" , "StockPrice" , "ConsumeFCT" , "LstByDsSum" , "StckINMPr" , "LstBINMPr" , "StckDstFc" , "StckDstSc" , "LstByDsFc" , "LstByDsSc" , "StockSum" , "StockSumFc" , "StockSumSc" , "StckSumApp" , "StckAppFc" , "StckAppSc" , "ShipToCode" , "ShipToDesc" , "StckAppD" , "StckAppDFC" , "StckAppDSC" , "BasePrice" , "GTotal" , "GTotalFC" , "GTotalSC" , "DistribExp" , "DescOW" , "DetailsOW" , "GrossBase" , "VatWoDpm" , "VatWoDpmFc" , "VatWoDpmSc" , "CFOPCode" , "CSTCode" , "Usage" , "TaxOnly" , "WtCalced" , "QtyToShip" , "DelivrdQty" , "OrderedQty" , "CogsOcrCod" , "CiOppLineN" , "CogsAcct" , "ChgAsmBoMW" , "ActDelDate" , "OcrCode2" , "OcrCode3" , "OcrCode4" , "OcrCode5" , "TaxDistSum" , "TaxDistSFC" , "TaxDistSSC" , "PostTax" , "Excisable" , "AssblValue" , "RG23APart1" , "RG23APart2" , "RG23CPart1" , "RG23CPart2" , "CogsOcrCo2" , "CogsOcrCo3" , "CogsOcrCo4" , "CogsOcrCo5" , "LnExcised" , "LocCode" , "StockValue" , "GPTtlBasPr" , "unitMsr2" , "NumPerMsr2" , "SpecPrice" , "CSTfIPI" , "CSTfPIS" , "CSTfCOFINS" , "ExLineNo" , "isSrvCall" , "PQTReqQty" , "PQTReqDate" , "PcDocType" , "PcQuantity" , "LinManClsd" , "VatGrpSrc" , "NoInvtryMv" , "ActBaseEnt" , "ActBaseLn" , "ActBaseNum" , "OpenRtnQty" , "AgrNo" , "AgrLnNum" , "CredOrigin" , "Surpluses" , "DefBreak" , "Shortages" , "UomEntry" , "UomEntry2" , "UomCode" , "UomCode2" , "FromWhsCod" , "NeedQty" , "PartRetire" , "RetireQty" , "RetireAPC" , "RetirAPCFC" , "RetirAPCSC" , "InvQty" , "OpenInvQty" , "EnSetCost" , "RetCost" , "Incoterms" , "TransMod" , "LineVendor" , "DistribIS" , "ISDistrb" , "ISDistrbFC" , "ISDistrbSC" , "IsByPrdct" , "ItemType" , "PriceEdit" , "PrntLnNum" , "LinePoPrss" , "FreeChrgBP" , "TaxRelev" , "LegalText" , "ThirdParty" , "LicTradNum" , "InvQtyOnly" , "UnencReasn" , "ShipFromCo" , "ShipFromDe" , "FisrtBin" , "AllocBinC" , "ExpType" , "ExpUUID" , "ExpOpType" , "DIOTNat" , "MYFtype" , "GPBefDisc" , "ReturnRsn" , "ReturnAct" , "StgSeqNum" , "StgEntry" , "StgDesc" , "ItmTaxType" , "SacEntry" , "NCMCode" , "HsnEntry" , "OriBAbsEnt" , "OriBLinNum" , "OriBDocTyp" , "IsPrscGood" , "IsCstmAct" , "EncryptIV" , "ExtTaxRate" , "ExtTaxSum" , "TaxAmtSrc" , "ExtTaxSumF" , "ExtTaxSumS" , "StdItemId" , "CommClass" , "VatExEntry" , "VatExLN" , "NatOfTrans" , "ISDtCryImp" , "ISDtRgnImp" , "ISOrCryExp" , "ISOrRgnExp" , "NVECode" , "PoNum" , "PoItmNum" , "IndEscala" , "CESTCode" , "CtrSealQty" , "CNJPMan" , "UFFiscBene" , "CUSplit" , "LegalTIMD" , "LegalTTCA" , "LegalTW" , "LegalTCD" , "RevCharge" , "ListNum" , "U_DescriptionItemXml" , "U_UDF_CodItemXML" , "U_UDF_DescItemXML" FROM PDN1;



--187-----------------------------------------------------------187--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_UDF_POR1_B1SLQuery" ( "DocEntry", "LineNum", "TargetType", "TrgetEntry", "BaseRef", "BaseType", "BaseEntry", "BaseLine", "LineStatus", "ItemCode", "Dscription", "Quantity", "ShipDate", "OpenQty", "Price", "Currency", "Rate", "DiscPrcnt", "LineTotal", "TotalFrgn", "OpenSum", "OpenSumFC", "VendorNum", "SerialNum", "WhsCode", "SlpCode", "Commission", "TreeType", "AcctCode", "TaxStatus", "GrossBuyPr", "PriceBefDi", "DocDate", "Flags", "OpenCreQty", "UseBaseUn", "SubCatNum", "BaseCard", "TotalSumSy", "OpenSumSys", "InvntSttus", "OcrCode", "Project", "CodeBars", "VatPrcnt", "VatGroup", "PriceAfVAT", "Height1", "Hght1Unit", "Height2", "Hght2Unit", "Width1", "Wdth1Unit", "Width2", "Wdth2Unit", "Length1", "Len1Unit", "length2", "Len2Unit", "Volume", "VolUnit", "Weight1", "Wght1Unit", "Weight2", "Wght2Unit", "Factor1", "Factor2", "Factor3", "Factor4", "PackQty", "UpdInvntry", "BaseDocNum", "BaseAtCard", "SWW", "VatSum", "VatSumFrgn", "VatSumSy", "FinncPriod", "ObjType", "LogInstanc", "BlockNum", "ImportLog", "DedVatSum", "DedVatSumF", "DedVatSumS", "IsAqcuistn", "DistribSum", "DstrbSumFC", "DstrbSumSC", "GrssProfit", "GrssProfSC", "GrssProfFC", "VisOrder", "INMPrice", "PoTrgNum", "PoTrgEntry", "DropShip", "PoLineNum", "Address", "TaxCode", "TaxType", "OrigItem", "BackOrdr", "FreeTxt", "PickStatus", "PickOty", "PickIdNo", "TrnsCode", "VatAppld", "VatAppldFC", "VatAppldSC", "BaseQty", "BaseOpnQty", "VatDscntPr", "WtLiable", "DeferrTax", "EquVatPer", "EquVatSum", "EquVatSumF", "EquVatSumS", "LineVat", "LineVatlF", "LineVatS", "unitMsr", "NumPerMsr", "CEECFlag", "ToStock", "ToDiff", "ExciseAmt", "TaxPerUnit", "TotInclTax", "CountryOrg", "StckDstSum", "ReleasQtty", "LineType", "TranType", "Text", "OwnerCode", "StockPrice", "ConsumeFCT", "LstByDsSum", "StckINMPr", "LstBINMPr", "StckDstFc", "StckDstSc", "LstByDsFc", "LstByDsSc", "StockSum", "StockSumFc", "StockSumSc", "StckSumApp", "StckAppFc", "StckAppSc", "ShipToCode", "ShipToDesc", "StckAppD", "StckAppDFC", "StckAppDSC", "BasePrice", "GTotal", "GTotalFC", "GTotalSC", "DistribExp", "DescOW", "DetailsOW", "GrossBase", "VatWoDpm", "VatWoDpmFc", "VatWoDpmSc", "CFOPCode", "CSTCode", "Usage", "TaxOnly", "WtCalced", "QtyToShip", "DelivrdQty", "OrderedQty", "CogsOcrCod", "CiOppLineN", "CogsAcct", "ChgAsmBoMW", "ActDelDate", "OcrCode2", "OcrCode3", "OcrCode4", "OcrCode5", "TaxDistSum", "TaxDistSFC", "TaxDistSSC", "PostTax", "Excisable", "AssblValue", "RG23APart1", "RG23APart2", "RG23CPart1", "RG23CPart2", "CogsOcrCo2", "CogsOcrCo3", "CogsOcrCo4", "CogsOcrCo5", "LnExcised", "LocCode", "StockValue", "GPTtlBasPr", "unitMsr2", "NumPerMsr2", "SpecPrice", "CSTfIPI", "CSTfPIS", "CSTfCOFINS", "ExLineNo", "isSrvCall", "PQTReqQty", "PQTReqDate", "PcDocType", "PcQuantity", "LinManClsd", "VatGrpSrc", "NoInvtryMv", "ActBaseEnt", "ActBaseLn", "ActBaseNum", "OpenRtnQty", "AgrNo", "AgrLnNum", "CredOrigin", "Surpluses", "DefBreak", "Shortages", "UomEntry", "UomEntry2", "UomCode", "UomCode2", "FromWhsCod", "NeedQty", "PartRetire", "RetireQty", "RetireAPC", "RetirAPCFC", "RetirAPCSC", "InvQty", "OpenInvQty", "EnSetCost", "RetCost", "Incoterms", "TransMod", "LineVendor", "DistribIS", "ISDistrb", "ISDistrbFC", "ISDistrbSC", "IsByPrdct", "ItemType", "PriceEdit", "PrntLnNum", "LinePoPrss", "FreeChrgBP", "TaxRelev", "LegalText", "ThirdParty", "LicTradNum", "InvQtyOnly", "UnencReasn", "ShipFromCo", "ShipFromDe", "FisrtBin", "AllocBinC", "ExpType", "ExpUUID", "ExpOpType", "DIOTNat", "MYFtype", "GPBefDisc", "ReturnRsn", "ReturnAct", "StgSeqNum", "StgEntry", "StgDesc", "ItmTaxType", "SacEntry", "NCMCode", "HsnEntry", "OriBAbsEnt", "OriBLinNum", "OriBDocTyp", "IsPrscGood", "IsCstmAct", "EncryptIV", "ExtTaxRate", "ExtTaxSum", "TaxAmtSrc", "ExtTaxSumF", "ExtTaxSumS", "StdItemId", "CommClass", "VatExEntry", "VatExLN", "NatOfTrans", "ISDtCryImp", "ISDtRgnImp", "ISOrCryExp", "ISOrRgnExp", "NVECode", "PoNum", "PoItmNum", "IndEscala", "CESTCode", "CtrSealQty", "CNJPMan", "UFFiscBene", "CUSplit", "LegalTIMD", "LegalTTCA", "LegalTW", "LegalTCD", "RevCharge", "ListNum", "U_DescriptionItemXml", "U_UDF_CodItemXML", "U_UDF_DescItemXML" ) AS SELECT "ORD"."DocEntry" , "ORD"."LineNum" , "ORD"."TargetType" , "ORD"."TrgetEntry" , "ORD"."BaseRef" , "ORD"."BaseType" , "ORD"."BaseEntry" , "ORD"."BaseLine" , "ORD"."LineStatus" , "ORD"."ItemCode" , "ORD"."Dscription" , "ORD"."Quantity" , "ORD"."ShipDate" , "ORD"."OpenQty" , "ORD"."Price" , "ORD"."Currency" , "ORD"."Rate" , "ORD"."DiscPrcnt" , "ORD"."LineTotal" , "ORD"."TotalFrgn" , "ORD"."OpenSum" , "ORD"."OpenSumFC" , "ORD"."VendorNum" , "ORD"."SerialNum" , "ORD"."WhsCode" , "ORD"."SlpCode" , "ORD"."Commission" , "ORD"."TreeType" , "ORD"."AcctCode" , "ORD"."TaxStatus" , "ORD"."GrossBuyPr" , "ORD"."PriceBefDi" , "ORD"."DocDate" , "ORD"."Flags" , "ORD"."OpenCreQty" , "ORD"."UseBaseUn" , "ORD"."SubCatNum" , "ORD"."BaseCard" , "ORD"."TotalSumSy" , "ORD"."OpenSumSys" , "ORD"."InvntSttus" , "ORD"."OcrCode" , "ORD"."Project" , "ORD"."CodeBars" , "ORD"."VatPrcnt" , "ORD"."VatGroup" , "ORD"."PriceAfVAT" , "ORD"."Height1" , "ORD"."Hght1Unit" , "ORD"."Height2" , "ORD"."Hght2Unit" , "ORD"."Width1" , "ORD"."Wdth1Unit" , "ORD"."Width2" , "ORD"."Wdth2Unit" , "ORD"."Length1" , "ORD"."Len1Unit" , "ORD"."length2" , "ORD"."Len2Unit" , "ORD"."Volume" , "ORD"."VolUnit" , "ORD"."Weight1" , "ORD"."Wght1Unit" , "ORD"."Weight2" , "ORD"."Wght2Unit" , "ORD"."Factor1" , "ORD"."Factor2" , "ORD"."Factor3" , "ORD"."Factor4" , "ORD"."PackQty" , "ORD"."UpdInvntry" , "ORD"."BaseDocNum" , "ORD"."BaseAtCard" , "ORD"."SWW" , "ORD"."VatSum" , "ORD"."VatSumFrgn" , "ORD"."VatSumSy" , "ORD"."FinncPriod" , "ORD"."ObjType" , "ORD"."LogInstanc" , "ORD"."BlockNum" , "ORD"."ImportLog" , "ORD"."DedVatSum" , "ORD"."DedVatSumF" , "ORD"."DedVatSumS" , "ORD"."IsAqcuistn" , "ORD"."DistribSum" , "ORD"."DstrbSumFC" , "ORD"."DstrbSumSC" , "ORD"."GrssProfit" , "ORD"."GrssProfSC" , "ORD"."GrssProfFC" , "ORD"."VisOrder" , "ORD"."INMPrice" , "ORD"."PoTrgNum" , "ORD"."PoTrgEntry" , "ORD"."DropShip" , "ORD"."PoLineNum" , "ORD"."Address" , "ORD"."TaxCode" , "ORD"."TaxType" , "ORD"."OrigItem" , "ORD"."BackOrdr" , "ORD"."FreeTxt" , "ORD"."PickStatus" , "ORD"."PickOty" , "ORD"."PickIdNo" , "ORD"."TrnsCode" , "ORD"."VatAppld" , "ORD"."VatAppldFC" , "ORD"."VatAppldSC" , "ORD"."BaseQty" , "ORD"."BaseOpnQty" , "ORD"."VatDscntPr" , "ORD"."WtLiable" , "ORD"."DeferrTax" , "ORD"."EquVatPer" , "ORD"."EquVatSum" , "ORD"."EquVatSumF" , "ORD"."EquVatSumS" , "ORD"."LineVat" , "ORD"."LineVatlF" , "ORD"."LineVatS" , "ORD"."unitMsr" , "ORD"."NumPerMsr" , "ORD"."CEECFlag" , "ORD"."ToStock" , "ORD"."ToDiff" , "ORD"."ExciseAmt" , "ORD"."TaxPerUnit" , "ORD"."TotInclTax" , "ORD"."CountryOrg" , "ORD"."StckDstSum" , "ORD"."ReleasQtty" , "ORD"."LineType" , "ORD"."TranType" , "ORD"."Text" , "ORD"."OwnerCode" , "ORD"."StockPrice" , "ORD"."ConsumeFCT" , "ORD"."LstByDsSum" , "ORD"."StckINMPr" , "ORD"."LstBINMPr" , "ORD"."StckDstFc" , "ORD"."StckDstSc" , "ORD"."LstByDsFc" , "ORD"."LstByDsSc" , "ORD"."StockSum" , "ORD"."StockSumFc" , "ORD"."StockSumSc" , "ORD"."StckSumApp" , "ORD"."StckAppFc" , "ORD"."StckAppSc" , "ORD"."ShipToCode" , "ORD"."ShipToDesc" , "ORD"."StckAppD" , "ORD"."StckAppDFC" , "ORD"."StckAppDSC" , "ORD"."BasePrice" , "ORD"."GTotal" , "ORD"."GTotalFC" , "ORD"."GTotalSC" , "ORD"."DistribExp" , "ORD"."DescOW" , "ORD"."DetailsOW" , "ORD"."GrossBase" , "ORD"."VatWoDpm" , "ORD"."VatWoDpmFc" , "ORD"."VatWoDpmSc" , "ORD"."CFOPCode" , "ORD"."CSTCode" , "ORD"."Usage" , "ORD"."TaxOnly" , "ORD"."WtCalced" , "ORD"."QtyToShip" , "ORD"."DelivrdQty" , "ORD"."OrderedQty" , "ORD"."CogsOcrCod" , "ORD"."CiOppLineN" , "ORD"."CogsAcct" , "ORD"."ChgAsmBoMW" , "ORD"."ActDelDate" , "ORD"."OcrCode2" , "ORD"."OcrCode3" , "ORD"."OcrCode4" , "ORD"."OcrCode5" , "ORD"."TaxDistSum" , "ORD"."TaxDistSFC" , "ORD"."TaxDistSSC" , "ORD"."PostTax" , "ORD"."Excisable" , "ORD"."AssblValue" , "ORD"."RG23APart1" , "ORD"."RG23APart2" , "ORD"."RG23CPart1" , "ORD"."RG23CPart2" , "ORD"."CogsOcrCo2" , "ORD"."CogsOcrCo3" , "ORD"."CogsOcrCo4" , "ORD"."CogsOcrCo5" , "ORD"."LnExcised" , "ORD"."LocCode" , "ORD"."StockValue" , "ORD"."GPTtlBasPr" , "ORD"."unitMsr2" , "ORD"."NumPerMsr2" , "ORD"."SpecPrice" , "ORD"."CSTfIPI" , "ORD"."CSTfPIS" , "ORD"."CSTfCOFINS" , "ORD"."ExLineNo" , "ORD"."isSrvCall" , "ORD"."PQTReqQty" , "ORD"."PQTReqDate" , "ORD"."PcDocType" , "ORD"."PcQuantity" , "ORD"."LinManClsd" , "ORD"."VatGrpSrc" , "ORD"."NoInvtryMv" , "ORD"."ActBaseEnt" , "ORD"."ActBaseLn" , "ORD"."ActBaseNum" , "ORD"."OpenRtnQty" , "ORD"."AgrNo" , "ORD"."AgrLnNum" , "ORD"."CredOrigin" , "ORD"."Surpluses" , "ORD"."DefBreak" , "ORD"."Shortages" , "ORD"."UomEntry" , "ORD"."UomEntry2" , "ORD"."UomCode" , "ORD"."UomCode2" , "ORD"."FromWhsCod" , "ORD"."NeedQty" , "ORD"."PartRetire" , "ORD"."RetireQty" , "ORD"."RetireAPC" , "ORD"."RetirAPCFC" , "ORD"."RetirAPCSC" , "ORD"."InvQty" , "ORD"."OpenInvQty" , "ORD"."EnSetCost" , "ORD"."RetCost" , "ORD"."Incoterms" , "ORD"."TransMod" , "ORD"."LineVendor" , "ORD"."DistribIS" , "ORD"."ISDistrb" , "ORD"."ISDistrbFC" , "ORD"."ISDistrbSC" , "ORD"."IsByPrdct" , "ORD"."ItemType" , "ORD"."PriceEdit" , "ORD"."PrntLnNum" , "ORD"."LinePoPrss" , "ORD"."FreeChrgBP" , "ORD"."TaxRelev" , "ORD"."LegalText" , "ORD"."ThirdParty" , "ORD"."LicTradNum" , "ORD"."InvQtyOnly" , "ORD"."UnencReasn" , "ORD"."ShipFromCo" , "ORD"."ShipFromDe" , "ORD"."FisrtBin" , "ORD"."AllocBinC" , "ORD"."ExpType" , "ORD"."ExpUUID" , "ORD"."ExpOpType" , "ORD"."DIOTNat" , "ORD"."MYFtype" , "ORD"."GPBefDisc" , "ORD"."ReturnRsn" , "ORD"."ReturnAct" , "ORD"."StgSeqNum" , "ORD"."StgEntry" , "ORD"."StgDesc" , "ORD"."ItmTaxType" , "ORD"."SacEntry" , "ORD"."NCMCode" , "ORD"."HsnEntry" , "ORD"."OriBAbsEnt" , "ORD"."OriBLinNum" , "ORD"."OriBDocTyp" , "ORD"."IsPrscGood" , "ORD"."IsCstmAct" , "ORD"."EncryptIV" , "ORD"."ExtTaxRate" , "ORD"."ExtTaxSum" , "ORD"."TaxAmtSrc" , "ORD"."ExtTaxSumF" , "ORD"."ExtTaxSumS" , "ORD"."StdItemId" , "ORD"."CommClass" , "ORD"."VatExEntry" , "ORD"."VatExLN" , "ORD"."NatOfTrans" , "ORD"."ISDtCryImp" , "ORD"."ISDtRgnImp" , "ORD"."ISOrCryExp" , "ORD"."ISOrRgnExp" , "ORD"."NVECode" , "ORD"."PoNum" , "ORD"."PoItmNum" , "ORD"."IndEscala" , "ORD"."CESTCode" , "ORD"."CtrSealQty" , "ORD"."CNJPMan" , "ORD"."UFFiscBene" , "ORD"."CUSplit" , "ORD"."LegalTIMD" , "ORD"."LegalTTCA" , "ORD"."LegalTW" , "ORD"."LegalTCD" , "ORD"."RevCharge" , "ORD"."ListNum" , "ORD"."U_DescriptionItemXml" , "ORD"."U_UDF_CodItemXML" , "ORD"."U_UDF_DescItemXML" FROM POR1 AS Ord;



--188-----------------------------------------------------------188--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_UDF_QUT1_B1SLQuery" ( "DocEntry", "LineNum", "TargetType", "TrgetEntry", "BaseRef", "BaseType", "BaseEntry", "BaseLine", "LineStatus", "ItemCode", "Dscription", "Quantity", "ShipDate", "OpenQty", "Price", "Currency", "Rate", "DiscPrcnt", "LineTotal", "TotalFrgn", "OpenSum", "OpenSumFC", "VendorNum", "SerialNum", "WhsCode", "SlpCode", "Commission", "TreeType", "AcctCode", "TaxStatus", "GrossBuyPr", "PriceBefDi", "DocDate", "Flags", "OpenCreQty", "UseBaseUn", "SubCatNum", "BaseCard", "TotalSumSy", "OpenSumSys", "InvntSttus", "OcrCode", "Project", "CodeBars", "VatPrcnt", "VatGroup", "PriceAfVAT", "Height1", "Hght1Unit", "Height2", "Hght2Unit", "Width1", "Wdth1Unit", "Width2", "Wdth2Unit", "Length1", "Len1Unit", "length2", "Len2Unit", "Volume", "VolUnit", "Weight1", "Wght1Unit", "Weight2", "Wght2Unit", "Factor1", "Factor2", "Factor3", "Factor4", "PackQty", "UpdInvntry", "BaseDocNum", "BaseAtCard", "SWW", "VatSum", "VatSumFrgn", "VatSumSy", "FinncPriod", "ObjType", "LogInstanc", "BlockNum", "ImportLog", "DedVatSum", "DedVatSumF", "DedVatSumS", "IsAqcuistn", "DistribSum", "DstrbSumFC", "DstrbSumSC", "GrssProfit", "GrssProfSC", "GrssProfFC", "VisOrder", "INMPrice", "PoTrgNum", "PoTrgEntry", "DropShip", "PoLineNum", "Address", "TaxCode", "TaxType", "OrigItem", "BackOrdr", "FreeTxt", "PickStatus", "PickOty", "PickIdNo", "TrnsCode", "VatAppld", "VatAppldFC", "VatAppldSC", "BaseQty", "BaseOpnQty", "VatDscntPr", "WtLiable", "DeferrTax", "EquVatPer", "EquVatSum", "EquVatSumF", "EquVatSumS", "LineVat", "LineVatlF", "LineVatS", "unitMsr", "NumPerMsr", "CEECFlag", "ToStock", "ToDiff", "ExciseAmt", "TaxPerUnit", "TotInclTax", "CountryOrg", "StckDstSum", "ReleasQtty", "LineType", "TranType", "Text", "OwnerCode", "StockPrice", "ConsumeFCT", "LstByDsSum", "StckINMPr", "LstBINMPr", "StckDstFc", "StckDstSc", "LstByDsFc", "LstByDsSc", "StockSum", "StockSumFc", "StockSumSc", "StckSumApp", "StckAppFc", "StckAppSc", "ShipToCode", "ShipToDesc", "StckAppD", "StckAppDFC", "StckAppDSC", "BasePrice", "GTotal", "GTotalFC", "GTotalSC", "DistribExp", "DescOW", "DetailsOW", "GrossBase", "VatWoDpm", "VatWoDpmFc", "VatWoDpmSc", "CFOPCode", "CSTCode", "Usage", "TaxOnly", "WtCalced", "QtyToShip", "DelivrdQty", "OrderedQty", "CogsOcrCod", "CiOppLineN", "CogsAcct", "ChgAsmBoMW", "ActDelDate", "OcrCode2", "OcrCode3", "OcrCode4", "OcrCode5", "TaxDistSum", "TaxDistSFC", "TaxDistSSC", "PostTax", "Excisable", "AssblValue", "RG23APart1", "RG23APart2", "RG23CPart1", "RG23CPart2", "CogsOcrCo2", "CogsOcrCo3", "CogsOcrCo4", "CogsOcrCo5", "LnExcised", "LocCode", "StockValue", "GPTtlBasPr", "unitMsr2", "NumPerMsr2", "SpecPrice", "CSTfIPI", "CSTfPIS", "CSTfCOFINS", "ExLineNo", "isSrvCall", "PQTReqQty", "PQTReqDate", "PcDocType", "PcQuantity", "LinManClsd", "VatGrpSrc", "NoInvtryMv", "ActBaseEnt", "ActBaseLn", "ActBaseNum", "OpenRtnQty", "AgrNo", "AgrLnNum", "CredOrigin", "Surpluses", "DefBreak", "Shortages", "UomEntry", "UomEntry2", "UomCode", "UomCode2", "FromWhsCod", "NeedQty", "PartRetire", "RetireQty", "RetireAPC", "RetirAPCFC", "RetirAPCSC", "InvQty", "OpenInvQty", "EnSetCost", "RetCost", "Incoterms", "TransMod", "LineVendor", "DistribIS", "ISDistrb", "ISDistrbFC", "ISDistrbSC", "IsByPrdct", "ItemType", "PriceEdit", "PrntLnNum", "LinePoPrss", "FreeChrgBP", "TaxRelev", "LegalText", "ThirdParty", "LicTradNum", "InvQtyOnly", "UnencReasn", "ShipFromCo", "ShipFromDe", "FisrtBin", "AllocBinC", "ExpType", "ExpUUID", "ExpOpType", "DIOTNat", "MYFtype", "GPBefDisc", "ReturnRsn", "ReturnAct", "StgSeqNum", "StgEntry", "StgDesc", "ItmTaxType", "SacEntry", "NCMCode", "HsnEntry", "OriBAbsEnt", "OriBLinNum", "OriBDocTyp", "IsPrscGood", "IsCstmAct", "EncryptIV", "ExtTaxRate", "ExtTaxSum", "TaxAmtSrc", "ExtTaxSumF", "ExtTaxSumS", "StdItemId", "CommClass", "VatExEntry", "VatExLN", "NatOfTrans", "ISDtCryImp", "ISDtRgnImp", "ISOrCryExp", "ISOrRgnExp", "NVECode", "PoNum", "PoItmNum", "IndEscala", "CESTCode", "CtrSealQty", "CNJPMan", "UFFiscBene", "CUSplit", "LegalTIMD", "LegalTTCA", "LegalTW", "LegalTCD", "RevCharge", "ListNum", "U_DescriptionItemXml", "U_UDF_CodItemXML", "U_UDF_DescItemXML" ) AS SELECT "ORD"."DocEntry" , "ORD"."LineNum" , "ORD"."TargetType" , "ORD"."TrgetEntry" , "ORD"."BaseRef" , "ORD"."BaseType" , "ORD"."BaseEntry" , "ORD"."BaseLine" , "ORD"."LineStatus" , "ORD"."ItemCode" , "ORD"."Dscription" , "ORD"."Quantity" , "ORD"."ShipDate" , "ORD"."OpenQty" , "ORD"."Price" , "ORD"."Currency" , "ORD"."Rate" , "ORD"."DiscPrcnt" , "ORD"."LineTotal" , "ORD"."TotalFrgn" , "ORD"."OpenSum" , "ORD"."OpenSumFC" , "ORD"."VendorNum" , "ORD"."SerialNum" , "ORD"."WhsCode" , "ORD"."SlpCode" , "ORD"."Commission" , "ORD"."TreeType" , "ORD"."AcctCode" , "ORD"."TaxStatus" , "ORD"."GrossBuyPr" , "ORD"."PriceBefDi" , "ORD"."DocDate" , "ORD"."Flags" , "ORD"."OpenCreQty" , "ORD"."UseBaseUn" , "ORD"."SubCatNum" , "ORD"."BaseCard" , "ORD"."TotalSumSy" , "ORD"."OpenSumSys" , "ORD"."InvntSttus" , "ORD"."OcrCode" , "ORD"."Project" , "ORD"."CodeBars" , "ORD"."VatPrcnt" , "ORD"."VatGroup" , "ORD"."PriceAfVAT" , "ORD"."Height1" , "ORD"."Hght1Unit" , "ORD"."Height2" , "ORD"."Hght2Unit" , "ORD"."Width1" , "ORD"."Wdth1Unit" , "ORD"."Width2" , "ORD"."Wdth2Unit" , "ORD"."Length1" , "ORD"."Len1Unit" , "ORD"."length2" , "ORD"."Len2Unit" , "ORD"."Volume" , "ORD"."VolUnit" , "ORD"."Weight1" , "ORD"."Wght1Unit" , "ORD"."Weight2" , "ORD"."Wght2Unit" , "ORD"."Factor1" , "ORD"."Factor2" , "ORD"."Factor3" , "ORD"."Factor4" , "ORD"."PackQty" , "ORD"."UpdInvntry" , "ORD"."BaseDocNum" , "ORD"."BaseAtCard" , "ORD"."SWW" , "ORD"."VatSum" , "ORD"."VatSumFrgn" , "ORD"."VatSumSy" , "ORD"."FinncPriod" , "ORD"."ObjType" , "ORD"."LogInstanc" , "ORD"."BlockNum" , "ORD"."ImportLog" , "ORD"."DedVatSum" , "ORD"."DedVatSumF" , "ORD"."DedVatSumS" , "ORD"."IsAqcuistn" , "ORD"."DistribSum" , "ORD"."DstrbSumFC" , "ORD"."DstrbSumSC" , "ORD"."GrssProfit" , "ORD"."GrssProfSC" , "ORD"."GrssProfFC" , "ORD"."VisOrder" , "ORD"."INMPrice" , "ORD"."PoTrgNum" , "ORD"."PoTrgEntry" , "ORD"."DropShip" , "ORD"."PoLineNum" , "ORD"."Address" , "ORD"."TaxCode" , "ORD"."TaxType" , "ORD"."OrigItem" , "ORD"."BackOrdr" , "ORD"."FreeTxt" , "ORD"."PickStatus" , "ORD"."PickOty" , "ORD"."PickIdNo" , "ORD"."TrnsCode" , "ORD"."VatAppld" , "ORD"."VatAppldFC" , "ORD"."VatAppldSC" , "ORD"."BaseQty" , "ORD"."BaseOpnQty" , "ORD"."VatDscntPr" , "ORD"."WtLiable" , "ORD"."DeferrTax" , "ORD"."EquVatPer" , "ORD"."EquVatSum" , "ORD"."EquVatSumF" , "ORD"."EquVatSumS" , "ORD"."LineVat" , "ORD"."LineVatlF" , "ORD"."LineVatS" , "ORD"."unitMsr" , "ORD"."NumPerMsr" , "ORD"."CEECFlag" , "ORD"."ToStock" , "ORD"."ToDiff" , "ORD"."ExciseAmt" , "ORD"."TaxPerUnit" , "ORD"."TotInclTax" , "ORD"."CountryOrg" , "ORD"."StckDstSum" , "ORD"."ReleasQtty" , "ORD"."LineType" , "ORD"."TranType" , "ORD"."Text" , "ORD"."OwnerCode" , "ORD"."StockPrice" , "ORD"."ConsumeFCT" , "ORD"."LstByDsSum" , "ORD"."StckINMPr" , "ORD"."LstBINMPr" , "ORD"."StckDstFc" , "ORD"."StckDstSc" , "ORD"."LstByDsFc" , "ORD"."LstByDsSc" , "ORD"."StockSum" , "ORD"."StockSumFc" , "ORD"."StockSumSc" , "ORD"."StckSumApp" , "ORD"."StckAppFc" , "ORD"."StckAppSc" , "ORD"."ShipToCode" , "ORD"."ShipToDesc" , "ORD"."StckAppD" , "ORD"."StckAppDFC" , "ORD"."StckAppDSC" , "ORD"."BasePrice" , "ORD"."GTotal" , "ORD"."GTotalFC" , "ORD"."GTotalSC" , "ORD"."DistribExp" , "ORD"."DescOW" , "ORD"."DetailsOW" , "ORD"."GrossBase" , "ORD"."VatWoDpm" , "ORD"."VatWoDpmFc" , "ORD"."VatWoDpmSc" , "ORD"."CFOPCode" , "ORD"."CSTCode" , "ORD"."Usage" , "ORD"."TaxOnly" , "ORD"."WtCalced" , "ORD"."QtyToShip" , "ORD"."DelivrdQty" , "ORD"."OrderedQty" , "ORD"."CogsOcrCod" , "ORD"."CiOppLineN" , "ORD"."CogsAcct" , "ORD"."ChgAsmBoMW" , "ORD"."ActDelDate" , "ORD"."OcrCode2" , "ORD"."OcrCode3" , "ORD"."OcrCode4" , "ORD"."OcrCode5" , "ORD"."TaxDistSum" , "ORD"."TaxDistSFC" , "ORD"."TaxDistSSC" , "ORD"."PostTax" , "ORD"."Excisable" , "ORD"."AssblValue" , "ORD"."RG23APart1" , "ORD"."RG23APart2" , "ORD"."RG23CPart1" , "ORD"."RG23CPart2" , "ORD"."CogsOcrCo2" , "ORD"."CogsOcrCo3" , "ORD"."CogsOcrCo4" , "ORD"."CogsOcrCo5" , "ORD"."LnExcised" , "ORD"."LocCode" , "ORD"."StockValue" , "ORD"."GPTtlBasPr" , "ORD"."unitMsr2" , "ORD"."NumPerMsr2" , "ORD"."SpecPrice" , "ORD"."CSTfIPI" , "ORD"."CSTfPIS" , "ORD"."CSTfCOFINS" , "ORD"."ExLineNo" , "ORD"."isSrvCall" , "ORD"."PQTReqQty" , "ORD"."PQTReqDate" , "ORD"."PcDocType" , "ORD"."PcQuantity" , "ORD"."LinManClsd" , "ORD"."VatGrpSrc" , "ORD"."NoInvtryMv" , "ORD"."ActBaseEnt" , "ORD"."ActBaseLn" , "ORD"."ActBaseNum" , "ORD"."OpenRtnQty" , "ORD"."AgrNo" , "ORD"."AgrLnNum" , "ORD"."CredOrigin" , "ORD"."Surpluses" , "ORD"."DefBreak" , "ORD"."Shortages" , "ORD"."UomEntry" , "ORD"."UomEntry2" , "ORD"."UomCode" , "ORD"."UomCode2" , "ORD"."FromWhsCod" , "ORD"."NeedQty" , "ORD"."PartRetire" , "ORD"."RetireQty" , "ORD"."RetireAPC" , "ORD"."RetirAPCFC" , "ORD"."RetirAPCSC" , "ORD"."InvQty" , "ORD"."OpenInvQty" , "ORD"."EnSetCost" , "ORD"."RetCost" , "ORD"."Incoterms" , "ORD"."TransMod" , "ORD"."LineVendor" , "ORD"."DistribIS" , "ORD"."ISDistrb" , "ORD"."ISDistrbFC" , "ORD"."ISDistrbSC" , "ORD"."IsByPrdct" , "ORD"."ItemType" , "ORD"."PriceEdit" , "ORD"."PrntLnNum" , "ORD"."LinePoPrss" , "ORD"."FreeChrgBP" , "ORD"."TaxRelev" , "ORD"."LegalText" , "ORD"."ThirdParty" , "ORD"."LicTradNum" , "ORD"."InvQtyOnly" , "ORD"."UnencReasn" , "ORD"."ShipFromCo" , "ORD"."ShipFromDe" , "ORD"."FisrtBin" , "ORD"."AllocBinC" , "ORD"."ExpType" , "ORD"."ExpUUID" , "ORD"."ExpOpType" , "ORD"."DIOTNat" , "ORD"."MYFtype" , "ORD"."GPBefDisc" , "ORD"."ReturnRsn" , "ORD"."ReturnAct" , "ORD"."StgSeqNum" , "ORD"."StgEntry" , "ORD"."StgDesc" , "ORD"."ItmTaxType" , "ORD"."SacEntry" , "ORD"."NCMCode" , "ORD"."HsnEntry" , "ORD"."OriBAbsEnt" , "ORD"."OriBLinNum" , "ORD"."OriBDocTyp" , "ORD"."IsPrscGood" , "ORD"."IsCstmAct" , "ORD"."EncryptIV" , "ORD"."ExtTaxRate" , "ORD"."ExtTaxSum" , "ORD"."TaxAmtSrc" , "ORD"."ExtTaxSumF" , "ORD"."ExtTaxSumS" , "ORD"."StdItemId" , "ORD"."CommClass" , "ORD"."VatExEntry" , "ORD"."VatExLN" , "ORD"."NatOfTrans" , "ORD"."ISDtCryImp" , "ORD"."ISDtRgnImp" , "ORD"."ISOrCryExp" , "ORD"."ISOrRgnExp" , "ORD"."NVECode" , "ORD"."PoNum" , "ORD"."PoItmNum" , "ORD"."IndEscala" , "ORD"."CESTCode" , "ORD"."CtrSealQty" , "ORD"."CNJPMan" , "ORD"."UFFiscBene" , "ORD"."CUSplit" , "ORD"."LegalTIMD" , "ORD"."LegalTTCA" , "ORD"."LegalTW" , "ORD"."LegalTCD" , "ORD"."RevCharge" , "ORD"."ListNum" , "ORD"."U_DescriptionItemXml" , "ORD"."U_UDF_CodItemXML" , "ORD"."U_UDF_DescItemXML" FROM QUT1 AS Ord;



--189-----------------------------------------------------------189--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_UDF_RDR1_B1SLQuery" ( "DocEntry", "LineNum", "TargetType", "TrgetEntry", "BaseRef", "BaseType", "BaseEntry", "BaseLine", "LineStatus", "ItemCode", "Dscription", "Quantity", "ShipDate", "OpenQty", "Price", "Currency", "Rate", "DiscPrcnt", "LineTotal", "TotalFrgn", "OpenSum", "OpenSumFC", "VendorNum", "SerialNum", "WhsCode", "SlpCode", "Commission", "TreeType", "AcctCode", "TaxStatus", "GrossBuyPr", "PriceBefDi", "DocDate", "Flags", "OpenCreQty", "UseBaseUn", "SubCatNum", "BaseCard", "TotalSumSy", "OpenSumSys", "InvntSttus", "OcrCode", "Project", "CodeBars", "VatPrcnt", "VatGroup", "PriceAfVAT", "Height1", "Hght1Unit", "Height2", "Hght2Unit", "Width1", "Wdth1Unit", "Width2", "Wdth2Unit", "Length1", "Len1Unit", "length2", "Len2Unit", "Volume", "VolUnit", "Weight1", "Wght1Unit", "Weight2", "Wght2Unit", "Factor1", "Factor2", "Factor3", "Factor4", "PackQty", "UpdInvntry", "BaseDocNum", "BaseAtCard", "SWW", "VatSum", "VatSumFrgn", "VatSumSy", "FinncPriod", "ObjType", "LogInstanc", "BlockNum", "ImportLog", "DedVatSum", "DedVatSumF", "DedVatSumS", "IsAqcuistn", "DistribSum", "DstrbSumFC", "DstrbSumSC", "GrssProfit", "GrssProfSC", "GrssProfFC", "VisOrder", "INMPrice", "PoTrgNum", "PoTrgEntry", "DropShip", "PoLineNum", "Address", "TaxCode", "TaxType", "OrigItem", "BackOrdr", "FreeTxt", "PickStatus", "PickOty", "PickIdNo", "TrnsCode", "VatAppld", "VatAppldFC", "VatAppldSC", "BaseQty", "BaseOpnQty", "VatDscntPr", "WtLiable", "DeferrTax", "EquVatPer", "EquVatSum", "EquVatSumF", "EquVatSumS", "LineVat", "LineVatlF", "LineVatS", "unitMsr", "NumPerMsr", "CEECFlag", "ToStock", "ToDiff", "ExciseAmt", "TaxPerUnit", "TotInclTax", "CountryOrg", "StckDstSum", "ReleasQtty", "LineType", "TranType", "Text", "OwnerCode", "StockPrice", "ConsumeFCT", "LstByDsSum", "StckINMPr", "LstBINMPr", "StckDstFc", "StckDstSc", "LstByDsFc", "LstByDsSc", "StockSum", "StockSumFc", "StockSumSc", "StckSumApp", "StckAppFc", "StckAppSc", "ShipToCode", "ShipToDesc", "StckAppD", "StckAppDFC", "StckAppDSC", "BasePrice", "GTotal", "GTotalFC", "GTotalSC", "DistribExp", "DescOW", "DetailsOW", "GrossBase", "VatWoDpm", "VatWoDpmFc", "VatWoDpmSc", "CFOPCode", "CSTCode", "Usage", "TaxOnly", "WtCalced", "QtyToShip", "DelivrdQty", "OrderedQty", "CogsOcrCod", "CiOppLineN", "CogsAcct", "ChgAsmBoMW", "ActDelDate", "OcrCode2", "OcrCode3", "OcrCode4", "OcrCode5", "TaxDistSum", "TaxDistSFC", "TaxDistSSC", "PostTax", "Excisable", "AssblValue", "RG23APart1", "RG23APart2", "RG23CPart1", "RG23CPart2", "CogsOcrCo2", "CogsOcrCo3", "CogsOcrCo4", "CogsOcrCo5", "LnExcised", "LocCode", "StockValue", "GPTtlBasPr", "unitMsr2", "NumPerMsr2", "SpecPrice", "CSTfIPI", "CSTfPIS", "CSTfCOFINS", "ExLineNo", "isSrvCall", "PQTReqQty", "PQTReqDate", "PcDocType", "PcQuantity", "LinManClsd", "VatGrpSrc", "NoInvtryMv", "ActBaseEnt", "ActBaseLn", "ActBaseNum", "OpenRtnQty", "AgrNo", "AgrLnNum", "CredOrigin", "Surpluses", "DefBreak", "Shortages", "UomEntry", "UomEntry2", "UomCode", "UomCode2", "FromWhsCod", "NeedQty", "PartRetire", "RetireQty", "RetireAPC", "RetirAPCFC", "RetirAPCSC", "InvQty", "OpenInvQty", "EnSetCost", "RetCost", "Incoterms", "TransMod", "LineVendor", "DistribIS", "ISDistrb", "ISDistrbFC", "ISDistrbSC", "IsByPrdct", "ItemType", "PriceEdit", "PrntLnNum", "LinePoPrss", "FreeChrgBP", "TaxRelev", "LegalText", "ThirdParty", "LicTradNum", "InvQtyOnly", "UnencReasn", "ShipFromCo", "ShipFromDe", "FisrtBin", "AllocBinC", "ExpType", "ExpUUID", "ExpOpType", "DIOTNat", "MYFtype", "GPBefDisc", "ReturnRsn", "ReturnAct", "StgSeqNum", "StgEntry", "StgDesc", "ItmTaxType", "SacEntry", "NCMCode", "HsnEntry", "OriBAbsEnt", "OriBLinNum", "OriBDocTyp", "IsPrscGood", "IsCstmAct", "EncryptIV", "ExtTaxRate", "ExtTaxSum", "TaxAmtSrc", "ExtTaxSumF", "ExtTaxSumS", "StdItemId", "CommClass", "VatExEntry", "VatExLN", "NatOfTrans", "ISDtCryImp", "ISDtRgnImp", "ISOrCryExp", "ISOrRgnExp", "NVECode", "PoNum", "PoItmNum", "IndEscala", "CESTCode", "CtrSealQty", "CNJPMan", "UFFiscBene", "CUSplit", "LegalTIMD", "LegalTTCA", "LegalTW", "LegalTCD", "RevCharge", "ListNum", "U_DescriptionItemXml", "U_UDF_CodItemXML", "U_UDF_DescItemXML" ) AS SELECT "ORD"."DocEntry" , "ORD"."LineNum" , "ORD"."TargetType" , "ORD"."TrgetEntry" , "ORD"."BaseRef" , "ORD"."BaseType" , "ORD"."BaseEntry" , "ORD"."BaseLine" , "ORD"."LineStatus" , "ORD"."ItemCode" , "ORD"."Dscription" , "ORD"."Quantity" , "ORD"."ShipDate" , "ORD"."OpenQty" , "ORD"."Price" , "ORD"."Currency" , "ORD"."Rate" , "ORD"."DiscPrcnt" , "ORD"."LineTotal" , "ORD"."TotalFrgn" , "ORD"."OpenSum" , "ORD"."OpenSumFC" , "ORD"."VendorNum" , "ORD"."SerialNum" , "ORD"."WhsCode" , "ORD"."SlpCode" , "ORD"."Commission" , "ORD"."TreeType" , "ORD"."AcctCode" , "ORD"."TaxStatus" , "ORD"."GrossBuyPr" , "ORD"."PriceBefDi" , "ORD"."DocDate" , "ORD"."Flags" , "ORD"."OpenCreQty" , "ORD"."UseBaseUn" , "ORD"."SubCatNum" , "ORD"."BaseCard" , "ORD"."TotalSumSy" , "ORD"."OpenSumSys" , "ORD"."InvntSttus" , "ORD"."OcrCode" , "ORD"."Project" , "ORD"."CodeBars" , "ORD"."VatPrcnt" , "ORD"."VatGroup" , "ORD"."PriceAfVAT" , "ORD"."Height1" , "ORD"."Hght1Unit" , "ORD"."Height2" , "ORD"."Hght2Unit" , "ORD"."Width1" , "ORD"."Wdth1Unit" , "ORD"."Width2" , "ORD"."Wdth2Unit" , "ORD"."Length1" , "ORD"."Len1Unit" , "ORD"."length2" , "ORD"."Len2Unit" , "ORD"."Volume" , "ORD"."VolUnit" , "ORD"."Weight1" , "ORD"."Wght1Unit" , "ORD"."Weight2" , "ORD"."Wght2Unit" , "ORD"."Factor1" , "ORD"."Factor2" , "ORD"."Factor3" , "ORD"."Factor4" , "ORD"."PackQty" , "ORD"."UpdInvntry" , "ORD"."BaseDocNum" , "ORD"."BaseAtCard" , "ORD"."SWW" , "ORD"."VatSum" , "ORD"."VatSumFrgn" , "ORD"."VatSumSy" , "ORD"."FinncPriod" , "ORD"."ObjType" , "ORD"."LogInstanc" , "ORD"."BlockNum" , "ORD"."ImportLog" , "ORD"."DedVatSum" , "ORD"."DedVatSumF" , "ORD"."DedVatSumS" , "ORD"."IsAqcuistn" , "ORD"."DistribSum" , "ORD"."DstrbSumFC" , "ORD"."DstrbSumSC" , "ORD"."GrssProfit" , "ORD"."GrssProfSC" , "ORD"."GrssProfFC" , "ORD"."VisOrder" , "ORD"."INMPrice" , "ORD"."PoTrgNum" , "ORD"."PoTrgEntry" , "ORD"."DropShip" , "ORD"."PoLineNum" , "ORD"."Address" , "ORD"."TaxCode" , "ORD"."TaxType" , "ORD"."OrigItem" , "ORD"."BackOrdr" , "ORD"."FreeTxt" , "ORD"."PickStatus" , "ORD"."PickOty" , "ORD"."PickIdNo" , "ORD"."TrnsCode" , "ORD"."VatAppld" , "ORD"."VatAppldFC" , "ORD"."VatAppldSC" , "ORD"."BaseQty" , "ORD"."BaseOpnQty" , "ORD"."VatDscntPr" , "ORD"."WtLiable" , "ORD"."DeferrTax" , "ORD"."EquVatPer" , "ORD"."EquVatSum" , "ORD"."EquVatSumF" , "ORD"."EquVatSumS" , "ORD"."LineVat" , "ORD"."LineVatlF" , "ORD"."LineVatS" , "ORD"."unitMsr" , "ORD"."NumPerMsr" , "ORD"."CEECFlag" , "ORD"."ToStock" , "ORD"."ToDiff" , "ORD"."ExciseAmt" , "ORD"."TaxPerUnit" , "ORD"."TotInclTax" , "ORD"."CountryOrg" , "ORD"."StckDstSum" , "ORD"."ReleasQtty" , "ORD"."LineType" , "ORD"."TranType" , "ORD"."Text" , "ORD"."OwnerCode" , "ORD"."StockPrice" , "ORD"."ConsumeFCT" , "ORD"."LstByDsSum" , "ORD"."StckINMPr" , "ORD"."LstBINMPr" , "ORD"."StckDstFc" , "ORD"."StckDstSc" , "ORD"."LstByDsFc" , "ORD"."LstByDsSc" , "ORD"."StockSum" , "ORD"."StockSumFc" , "ORD"."StockSumSc" , "ORD"."StckSumApp" , "ORD"."StckAppFc" , "ORD"."StckAppSc" , "ORD"."ShipToCode" , "ORD"."ShipToDesc" , "ORD"."StckAppD" , "ORD"."StckAppDFC" , "ORD"."StckAppDSC" , "ORD"."BasePrice" , "ORD"."GTotal" , "ORD"."GTotalFC" , "ORD"."GTotalSC" , "ORD"."DistribExp" , "ORD"."DescOW" , "ORD"."DetailsOW" , "ORD"."GrossBase" , "ORD"."VatWoDpm" , "ORD"."VatWoDpmFc" , "ORD"."VatWoDpmSc" , "ORD"."CFOPCode" , "ORD"."CSTCode" , "ORD"."Usage" , "ORD"."TaxOnly" , "ORD"."WtCalced" , "ORD"."QtyToShip" , "ORD"."DelivrdQty" , "ORD"."OrderedQty" , "ORD"."CogsOcrCod" , "ORD"."CiOppLineN" , "ORD"."CogsAcct" , "ORD"."ChgAsmBoMW" , "ORD"."ActDelDate" , "ORD"."OcrCode2" , "ORD"."OcrCode3" , "ORD"."OcrCode4" , "ORD"."OcrCode5" , "ORD"."TaxDistSum" , "ORD"."TaxDistSFC" , "ORD"."TaxDistSSC" , "ORD"."PostTax" , "ORD"."Excisable" , "ORD"."AssblValue" , "ORD"."RG23APart1" , "ORD"."RG23APart2" , "ORD"."RG23CPart1" , "ORD"."RG23CPart2" , "ORD"."CogsOcrCo2" , "ORD"."CogsOcrCo3" , "ORD"."CogsOcrCo4" , "ORD"."CogsOcrCo5" , "ORD"."LnExcised" , "ORD"."LocCode" , "ORD"."StockValue" , "ORD"."GPTtlBasPr" , "ORD"."unitMsr2" , "ORD"."NumPerMsr2" , "ORD"."SpecPrice" , "ORD"."CSTfIPI" , "ORD"."CSTfPIS" , "ORD"."CSTfCOFINS" , "ORD"."ExLineNo" , "ORD"."isSrvCall" , "ORD"."PQTReqQty" , "ORD"."PQTReqDate" , "ORD"."PcDocType" , "ORD"."PcQuantity" , "ORD"."LinManClsd" , "ORD"."VatGrpSrc" , "ORD"."NoInvtryMv" , "ORD"."ActBaseEnt" , "ORD"."ActBaseLn" , "ORD"."ActBaseNum" , "ORD"."OpenRtnQty" , "ORD"."AgrNo" , "ORD"."AgrLnNum" , "ORD"."CredOrigin" , "ORD"."Surpluses" , "ORD"."DefBreak" , "ORD"."Shortages" , "ORD"."UomEntry" , "ORD"."UomEntry2" , "ORD"."UomCode" , "ORD"."UomCode2" , "ORD"."FromWhsCod" , "ORD"."NeedQty" , "ORD"."PartRetire" , "ORD"."RetireQty" , "ORD"."RetireAPC" , "ORD"."RetirAPCFC" , "ORD"."RetirAPCSC" , "ORD"."InvQty" , "ORD"."OpenInvQty" , "ORD"."EnSetCost" , "ORD"."RetCost" , "ORD"."Incoterms" , "ORD"."TransMod" , "ORD"."LineVendor" , "ORD"."DistribIS" , "ORD"."ISDistrb" , "ORD"."ISDistrbFC" , "ORD"."ISDistrbSC" , "ORD"."IsByPrdct" , "ORD"."ItemType" , "ORD"."PriceEdit" , "ORD"."PrntLnNum" , "ORD"."LinePoPrss" , "ORD"."FreeChrgBP" , "ORD"."TaxRelev" , "ORD"."LegalText" , "ORD"."ThirdParty" , "ORD"."LicTradNum" , "ORD"."InvQtyOnly" , "ORD"."UnencReasn" , "ORD"."ShipFromCo" , "ORD"."ShipFromDe" , "ORD"."FisrtBin" , "ORD"."AllocBinC" , "ORD"."ExpType" , "ORD"."ExpUUID" , "ORD"."ExpOpType" , "ORD"."DIOTNat" , "ORD"."MYFtype" , "ORD"."GPBefDisc" , "ORD"."ReturnRsn" , "ORD"."ReturnAct" , "ORD"."StgSeqNum" , "ORD"."StgEntry" , "ORD"."StgDesc" , "ORD"."ItmTaxType" , "ORD"."SacEntry" , "ORD"."NCMCode" , "ORD"."HsnEntry" , "ORD"."OriBAbsEnt" , "ORD"."OriBLinNum" , "ORD"."OriBDocTyp" , "ORD"."IsPrscGood" , "ORD"."IsCstmAct" , "ORD"."EncryptIV" , "ORD"."ExtTaxRate" , "ORD"."ExtTaxSum" , "ORD"."TaxAmtSrc" , "ORD"."ExtTaxSumF" , "ORD"."ExtTaxSumS" , "ORD"."StdItemId" , "ORD"."CommClass" , "ORD"."VatExEntry" , "ORD"."VatExLN" , "ORD"."NatOfTrans" , "ORD"."ISDtCryImp" , "ORD"."ISDtRgnImp" , "ORD"."ISOrCryExp" , "ORD"."ISOrRgnExp" , "ORD"."NVECode" , "ORD"."PoNum" , "ORD"."PoItmNum" , "ORD"."IndEscala" , "ORD"."CESTCode" , "ORD"."CtrSealQty" , "ORD"."CNJPMan" , "ORD"."UFFiscBene" , "ORD"."CUSplit" , "ORD"."LegalTIMD" , "ORD"."LegalTTCA" , "ORD"."LegalTW" , "ORD"."LegalTCD" , "ORD"."RevCharge" , "ORD"."ListNum" , "ORD"."U_DescriptionItemXml" , "ORD"."U_UDF_CodItemXML" , "ORD"."U_UDF_DescItemXML" FROM RDR1 AS Ord;



--190-----------------------------------------------------------190--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_UDF_WTQ1_B1SLQuery" ( "DocEntry", "LineNum", "TargetType", "TrgetEntry", "BaseRef", "BaseType", "BaseEntry", "BaseLine", "LineStatus", "ItemCode", "Dscription", "Quantity", "ShipDate", "OpenQty", "Price", "Currency", "Rate", "DiscPrcnt", "LineTotal", "TotalFrgn", "OpenSum", "OpenSumFC", "VendorNum", "SerialNum", "WhsCode", "SlpCode", "Commission", "TreeType", "AcctCode", "TaxStatus", "GrossBuyPr", "PriceBefDi", "DocDate", "Flags", "OpenCreQty", "UseBaseUn", "SubCatNum", "BaseCard", "TotalSumSy", "OpenSumSys", "InvntSttus", "OcrCode", "Project", "CodeBars", "VatPrcnt", "VatGroup", "PriceAfVAT", "Height1", "Hght1Unit", "Height2", "Hght2Unit", "Width1", "Wdth1Unit", "Width2", "Wdth2Unit", "Length1", "Len1Unit", "length2", "Len2Unit", "Volume", "VolUnit", "Weight1", "Wght1Unit", "Weight2", "Wght2Unit", "Factor1", "Factor2", "Factor3", "Factor4", "PackQty", "UpdInvntry", "BaseDocNum", "BaseAtCard", "SWW", "VatSum", "VatSumFrgn", "VatSumSy", "FinncPriod", "ObjType", "LogInstanc", "BlockNum", "ImportLog", "DedVatSum", "DedVatSumF", "DedVatSumS", "IsAqcuistn", "DistribSum", "DstrbSumFC", "DstrbSumSC", "GrssProfit", "GrssProfSC", "GrssProfFC", "VisOrder", "INMPrice", "PoTrgNum", "PoTrgEntry", "DropShip", "PoLineNum", "Address", "TaxCode", "TaxType", "OrigItem", "BackOrdr", "FreeTxt", "PickStatus", "PickOty", "PickIdNo", "TrnsCode", "VatAppld", "VatAppldFC", "VatAppldSC", "BaseQty", "BaseOpnQty", "VatDscntPr", "WtLiable", "DeferrTax", "EquVatPer", "EquVatSum", "EquVatSumF", "EquVatSumS", "LineVat", "LineVatlF", "LineVatS", "unitMsr", "NumPerMsr", "CEECFlag", "ToStock", "ToDiff", "ExciseAmt", "TaxPerUnit", "TotInclTax", "CountryOrg", "StckDstSum", "ReleasQtty", "LineType", "TranType", "Text", "OwnerCode", "StockPrice", "ConsumeFCT", "LstByDsSum", "StckINMPr", "LstBINMPr", "StckDstFc", "StckDstSc", "LstByDsFc", "LstByDsSc", "StockSum", "StockSumFc", "StockSumSc", "StckSumApp", "StckAppFc", "StckAppSc", "ShipToCode", "ShipToDesc", "StckAppD", "StckAppDFC", "StckAppDSC", "BasePrice", "GTotal", "GTotalFC", "GTotalSC", "DistribExp", "DescOW", "DetailsOW", "GrossBase", "VatWoDpm", "VatWoDpmFc", "VatWoDpmSc", "CFOPCode", "CSTCode", "Usage", "TaxOnly", "WtCalced", "QtyToShip", "DelivrdQty", "OrderedQty", "CogsOcrCod", "CiOppLineN", "CogsAcct", "ChgAsmBoMW", "ActDelDate", "OcrCode2", "OcrCode3", "OcrCode4", "OcrCode5", "TaxDistSum", "TaxDistSFC", "TaxDistSSC", "PostTax", "Excisable", "AssblValue", "RG23APart1", "RG23APart2", "RG23CPart1", "RG23CPart2", "CogsOcrCo2", "CogsOcrCo3", "CogsOcrCo4", "CogsOcrCo5", "LnExcised", "LocCode", "StockValue", "GPTtlBasPr", "unitMsr2", "NumPerMsr2", "SpecPrice", "CSTfIPI", "CSTfPIS", "CSTfCOFINS", "ExLineNo", "isSrvCall", "PQTReqQty", "PQTReqDate", "PcDocType", "PcQuantity", "LinManClsd", "VatGrpSrc", "NoInvtryMv", "ActBaseEnt", "ActBaseLn", "ActBaseNum", "OpenRtnQty", "AgrNo", "AgrLnNum", "CredOrigin", "Surpluses", "DefBreak", "Shortages", "UomEntry", "UomEntry2", "UomCode", "UomCode2", "FromWhsCod", "NeedQty", "PartRetire", "RetireQty", "RetireAPC", "RetirAPCFC", "RetirAPCSC", "InvQty", "OpenInvQty", "EnSetCost", "RetCost", "Incoterms", "TransMod", "LineVendor", "DistribIS", "ISDistrb", "ISDistrbFC", "ISDistrbSC", "IsByPrdct", "ItemType", "PriceEdit", "PrntLnNum", "LinePoPrss", "FreeChrgBP", "TaxRelev", "LegalText", "ThirdParty", "LicTradNum", "InvQtyOnly", "UnencReasn", "ShipFromCo", "ShipFromDe", "FisrtBin", "AllocBinC", "ExpType", "ExpUUID", "ExpOpType", "DIOTNat", "MYFtype", "GPBefDisc", "ReturnRsn", "ReturnAct", "StgSeqNum", "StgEntry", "StgDesc", "ItmTaxType", "SacEntry", "NCMCode", "HsnEntry", "OriBAbsEnt", "OriBLinNum", "OriBDocTyp", "IsPrscGood", "IsCstmAct", "EncryptIV", "ExtTaxRate", "ExtTaxSum", "TaxAmtSrc", "ExtTaxSumF", "ExtTaxSumS", "StdItemId", "CommClass", "VatExEntry", "VatExLN", "NatOfTrans", "ISDtCryImp", "ISDtRgnImp", "ISOrCryExp", "ISOrRgnExp", "NVECode", "PoNum", "PoItmNum", "IndEscala", "CESTCode", "CtrSealQty", "CNJPMan", "UFFiscBene", "CUSplit", "LegalTIMD", "LegalTTCA", "LegalTW", "LegalTCD", "RevCharge", "ListNum", "U_DescriptionItemXml", "U_UDF_CodItemXML", "U_UDF_DescItemXML" ) AS SELECT "ORD"."DocEntry" , "ORD"."LineNum" , "ORD"."TargetType" , "ORD"."TrgetEntry" , "ORD"."BaseRef" , "ORD"."BaseType" , "ORD"."BaseEntry" , "ORD"."BaseLine" , "ORD"."LineStatus" , "ORD"."ItemCode" , "ORD"."Dscription" , "ORD"."Quantity" , "ORD"."ShipDate" , "ORD"."OpenQty" , "ORD"."Price" , "ORD"."Currency" , "ORD"."Rate" , "ORD"."DiscPrcnt" , "ORD"."LineTotal" , "ORD"."TotalFrgn" , "ORD"."OpenSum" , "ORD"."OpenSumFC" , "ORD"."VendorNum" , "ORD"."SerialNum" , "ORD"."WhsCode" , "ORD"."SlpCode" , "ORD"."Commission" , "ORD"."TreeType" , "ORD"."AcctCode" , "ORD"."TaxStatus" , "ORD"."GrossBuyPr" , "ORD"."PriceBefDi" , "ORD"."DocDate" , "ORD"."Flags" , "ORD"."OpenCreQty" , "ORD"."UseBaseUn" , "ORD"."SubCatNum" , "ORD"."BaseCard" , "ORD"."TotalSumSy" , "ORD"."OpenSumSys" , "ORD"."InvntSttus" , "ORD"."OcrCode" , "ORD"."Project" , "ORD"."CodeBars" , "ORD"."VatPrcnt" , "ORD"."VatGroup" , "ORD"."PriceAfVAT" , "ORD"."Height1" , "ORD"."Hght1Unit" , "ORD"."Height2" , "ORD"."Hght2Unit" , "ORD"."Width1" , "ORD"."Wdth1Unit" , "ORD"."Width2" , "ORD"."Wdth2Unit" , "ORD"."Length1" , "ORD"."Len1Unit" , "ORD"."length2" , "ORD"."Len2Unit" , "ORD"."Volume" , "ORD"."VolUnit" , "ORD"."Weight1" , "ORD"."Wght1Unit" , "ORD"."Weight2" , "ORD"."Wght2Unit" , "ORD"."Factor1" , "ORD"."Factor2" , "ORD"."Factor3" , "ORD"."Factor4" , "ORD"."PackQty" , "ORD"."UpdInvntry" , "ORD"."BaseDocNum" , "ORD"."BaseAtCard" , "ORD"."SWW" , "ORD"."VatSum" , "ORD"."VatSumFrgn" , "ORD"."VatSumSy" , "ORD"."FinncPriod" , "ORD"."ObjType" , "ORD"."LogInstanc" , "ORD"."BlockNum" , "ORD"."ImportLog" , "ORD"."DedVatSum" , "ORD"."DedVatSumF" , "ORD"."DedVatSumS" , "ORD"."IsAqcuistn" , "ORD"."DistribSum" , "ORD"."DstrbSumFC" , "ORD"."DstrbSumSC" , "ORD"."GrssProfit" , "ORD"."GrssProfSC" , "ORD"."GrssProfFC" , "ORD"."VisOrder" , "ORD"."INMPrice" , "ORD"."PoTrgNum" , "ORD"."PoTrgEntry" , "ORD"."DropShip" , "ORD"."PoLineNum" , "ORD"."Address" , "ORD"."TaxCode" , "ORD"."TaxType" , "ORD"."OrigItem" , "ORD"."BackOrdr" , "ORD"."FreeTxt" , "ORD"."PickStatus" , "ORD"."PickOty" , "ORD"."PickIdNo" , "ORD"."TrnsCode" , "ORD"."VatAppld" , "ORD"."VatAppldFC" , "ORD"."VatAppldSC" , "ORD"."BaseQty" , "ORD"."BaseOpnQty" , "ORD"."VatDscntPr" , "ORD"."WtLiable" , "ORD"."DeferrTax" , "ORD"."EquVatPer" , "ORD"."EquVatSum" , "ORD"."EquVatSumF" , "ORD"."EquVatSumS" , "ORD"."LineVat" , "ORD"."LineVatlF" , "ORD"."LineVatS" , "ORD"."unitMsr" , "ORD"."NumPerMsr" , "ORD"."CEECFlag" , "ORD"."ToStock" , "ORD"."ToDiff" , "ORD"."ExciseAmt" , "ORD"."TaxPerUnit" , "ORD"."TotInclTax" , "ORD"."CountryOrg" , "ORD"."StckDstSum" , "ORD"."ReleasQtty" , "ORD"."LineType" , "ORD"."TranType" , "ORD"."Text" , "ORD"."OwnerCode" , "ORD"."StockPrice" , "ORD"."ConsumeFCT" , "ORD"."LstByDsSum" , "ORD"."StckINMPr" , "ORD"."LstBINMPr" , "ORD"."StckDstFc" , "ORD"."StckDstSc" , "ORD"."LstByDsFc" , "ORD"."LstByDsSc" , "ORD"."StockSum" , "ORD"."StockSumFc" , "ORD"."StockSumSc" , "ORD"."StckSumApp" , "ORD"."StckAppFc" , "ORD"."StckAppSc" , "ORD"."ShipToCode" , "ORD"."ShipToDesc" , "ORD"."StckAppD" , "ORD"."StckAppDFC" , "ORD"."StckAppDSC" , "ORD"."BasePrice" , "ORD"."GTotal" , "ORD"."GTotalFC" , "ORD"."GTotalSC" , "ORD"."DistribExp" , "ORD"."DescOW" , "ORD"."DetailsOW" , "ORD"."GrossBase" , "ORD"."VatWoDpm" , "ORD"."VatWoDpmFc" , "ORD"."VatWoDpmSc" , "ORD"."CFOPCode" , "ORD"."CSTCode" , "ORD"."Usage" , "ORD"."TaxOnly" , "ORD"."WtCalced" , "ORD"."QtyToShip" , "ORD"."DelivrdQty" , "ORD"."OrderedQty" , "ORD"."CogsOcrCod" , "ORD"."CiOppLineN" , "ORD"."CogsAcct" , "ORD"."ChgAsmBoMW" , "ORD"."ActDelDate" , "ORD"."OcrCode2" , "ORD"."OcrCode3" , "ORD"."OcrCode4" , "ORD"."OcrCode5" , "ORD"."TaxDistSum" , "ORD"."TaxDistSFC" , "ORD"."TaxDistSSC" , "ORD"."PostTax" , "ORD"."Excisable" , "ORD"."AssblValue" , "ORD"."RG23APart1" , "ORD"."RG23APart2" , "ORD"."RG23CPart1" , "ORD"."RG23CPart2" , "ORD"."CogsOcrCo2" , "ORD"."CogsOcrCo3" , "ORD"."CogsOcrCo4" , "ORD"."CogsOcrCo5" , "ORD"."LnExcised" , "ORD"."LocCode" , "ORD"."StockValue" , "ORD"."GPTtlBasPr" , "ORD"."unitMsr2" , "ORD"."NumPerMsr2" , "ORD"."SpecPrice" , "ORD"."CSTfIPI" , "ORD"."CSTfPIS" , "ORD"."CSTfCOFINS" , "ORD"."ExLineNo" , "ORD"."isSrvCall" , "ORD"."PQTReqQty" , "ORD"."PQTReqDate" , "ORD"."PcDocType" , "ORD"."PcQuantity" , "ORD"."LinManClsd" , "ORD"."VatGrpSrc" , "ORD"."NoInvtryMv" , "ORD"."ActBaseEnt" , "ORD"."ActBaseLn" , "ORD"."ActBaseNum" , "ORD"."OpenRtnQty" , "ORD"."AgrNo" , "ORD"."AgrLnNum" , "ORD"."CredOrigin" , "ORD"."Surpluses" , "ORD"."DefBreak" , "ORD"."Shortages" , "ORD"."UomEntry" , "ORD"."UomEntry2" , "ORD"."UomCode" , "ORD"."UomCode2" , "ORD"."FromWhsCod" , "ORD"."NeedQty" , "ORD"."PartRetire" , "ORD"."RetireQty" , "ORD"."RetireAPC" , "ORD"."RetirAPCFC" , "ORD"."RetirAPCSC" , "ORD"."InvQty" , "ORD"."OpenInvQty" , "ORD"."EnSetCost" , "ORD"."RetCost" , "ORD"."Incoterms" , "ORD"."TransMod" , "ORD"."LineVendor" , "ORD"."DistribIS" , "ORD"."ISDistrb" , "ORD"."ISDistrbFC" , "ORD"."ISDistrbSC" , "ORD"."IsByPrdct" , "ORD"."ItemType" , "ORD"."PriceEdit" , "ORD"."PrntLnNum" , "ORD"."LinePoPrss" , "ORD"."FreeChrgBP" , "ORD"."TaxRelev" , "ORD"."LegalText" , "ORD"."ThirdParty" , "ORD"."LicTradNum" , "ORD"."InvQtyOnly" , "ORD"."UnencReasn" , "ORD"."ShipFromCo" , "ORD"."ShipFromDe" , "ORD"."FisrtBin" , "ORD"."AllocBinC" , "ORD"."ExpType" , "ORD"."ExpUUID" , "ORD"."ExpOpType" , "ORD"."DIOTNat" , "ORD"."MYFtype" , "ORD"."GPBefDisc" , "ORD"."ReturnRsn" , "ORD"."ReturnAct" , "ORD"."StgSeqNum" , "ORD"."StgEntry" , "ORD"."StgDesc" , "ORD"."ItmTaxType" , "ORD"."SacEntry" , "ORD"."NCMCode" , "ORD"."HsnEntry" , "ORD"."OriBAbsEnt" , "ORD"."OriBLinNum" , "ORD"."OriBDocTyp" , "ORD"."IsPrscGood" , "ORD"."IsCstmAct" , "ORD"."EncryptIV" , "ORD"."ExtTaxRate" , "ORD"."ExtTaxSum" , "ORD"."TaxAmtSrc" , "ORD"."ExtTaxSumF" , "ORD"."ExtTaxSumS" , "ORD"."StdItemId" , "ORD"."CommClass" , "ORD"."VatExEntry" , "ORD"."VatExLN" , "ORD"."NatOfTrans" , "ORD"."ISDtCryImp" , "ORD"."ISDtRgnImp" , "ORD"."ISOrCryExp" , "ORD"."ISOrRgnExp" , "ORD"."NVECode" , "ORD"."PoNum" , "ORD"."PoItmNum" , "ORD"."IndEscala" , "ORD"."CESTCode" , "ORD"."CtrSealQty" , "ORD"."CNJPMan" , "ORD"."UFFiscBene" , "ORD"."CUSplit" , "ORD"."LegalTIMD" , "ORD"."LegalTTCA" , "ORD"."LegalTW" , "ORD"."LegalTCD" , "ORD"."RevCharge" , "ORD"."ListNum" , "ORD"."U_DescriptionItemXml" , "ORD"."U_UDF_CodItemXML" , "ORD"."U_UDF_DescItemXML" FROM WTQ1 AS Ord;



--191-----------------------------------------------------------191--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_UOMMASTERDATA_B1SLQuery" ( "ItemCode", "UnitPrice", "UnitPriceFC", "PriceList", "UomCode", "UomName", "UoMEntry", "PrchseItem", "sort_order" ) AS (((SELECT
	 ItemsPrices."ItemCode",
	 COALESCE( CAST( CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY(COALESCE(ItemsPrices."Currency",'')) = 1 
					THEN Items."AvgPrice" 
					ELSE Items."AvgPrice" * ( SELECT
	 CAST("Rate" AS DECIMAL(10,
	2)) 
						FROM ORTT 
						WHERE CAST("RateDate" AS DATE) = CURRENT_DATE 
						AND "Currency" = ( SELECT
	 "Id" 
							FROM "CLVS_D_MLT_SLT_CURRENCIES_B1SLQuery" 
							WHERE "IsLocal" = 0 
							AND "Id" <> '##' ) ) 
					END AS DECIMAL(18,
	2)) ,
	 0) AS "UnitPrice",
	 COALESCE( CAST( CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY(COALESCE(ItemsPrices."Currency",'')) = 1 
					THEN Items."AvgPrice" / ( SELECT
	 CAST("Rate" AS DECIMAL(10,
	2)) 
						FROM ORTT 
						WHERE CAST("RateDate" AS DATE) = CURRENT_DATE 
						AND "Currency" = ( SELECT
	 "Id" 
							FROM "CLVS_D_MLT_SLT_CURRENCIES_B1SLQuery" 
							WHERE "IsLocal" = 0 
							AND "Id" <> '##' ) ) 
					ELSE Items."AvgPrice" 
					END AS DECIMAL(18,
	2)) ,
	 0) AS "UnitPriceFC",
	 ItemsPrices."PriceList",
	 UoMMasterData."UomCode",
	 UoMMasterData."UomName",
	 ItemsPrices."UomEntry" AS "UoMEntry",
	 'Y' AS "PrchseItem",
	 0 AS "sort_order" 
			FROM "ITM1" ItemsPrices 
			INNER JOIN "OITM" Items ON ItemsPrices."ItemCode" = Items."ItemCode" 
			LEFT JOIN "OUOM" UoMMasterData ON ItemsPrices."UomEntry" = UoMMasterData."UomEntry") UNION ALL (SELECT
	 ItemsPrices."ItemCode",
	 COALESCE( CAST( CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY(COALESCE(ItemsPrices."Currency",'')) = 1 
					THEN ItemsPrices."Price" 
					ELSE ItemsPrices."Price" * ( SELECT
	 CAST("Rate" AS DECIMAL(10,
	2)) 
						FROM ORTT 
						WHERE CAST("RateDate" AS DATE) = CURRENT_DATE 
						AND "Currency" = ( SELECT
	 "Id" 
							FROM "CLVS_D_MLT_SLT_CURRENCIES_B1SLQuery" 
							WHERE "IsLocal" = 0 
							AND "Id" <> '##' ) ) 
					END AS DECIMAL(18,
	2)) ,
	 0) AS "UnitPrice",
	 COALESCE( CAST( CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY(COALESCE(ItemsPrices."Currency",'')) = 1 
					THEN ItemsPrices."Price" / ( SELECT
	 CAST("Rate" AS DECIMAL(10,
	2)) 
						FROM ORTT 
						WHERE CAST("RateDate" AS DATE) = CURRENT_DATE 
						AND "Currency" = ( SELECT
	 "Id" 
							FROM "CLVS_D_MLT_SLT_CURRENCIES_B1SLQuery" 
							WHERE "IsLocal" = 0 
							AND "Id" <> '##' ) ) 
					ELSE ItemsPrices."Price" 
					END AS DECIMAL(18,
	2)) ,
	 0) AS "UnitPriceFC",
	 ItemsPrices."PriceList",
	 ouom."UomCode",
	 ouom."UomName",
	 ItemsPrices."UomEntry" AS "UoMEntry",
	 'N' AS "PrchseItem",
	 0 AS "sort_order" 
			FROM "ITM1" ItemsPrices 
			INNER JOIN "OUOM" ouom ON ItemsPrices."UomEntry" = ouom."UomEntry")) UNION ALL (SELECT
	 UoMPrices."ItemCode",
	 COALESCE( CAST( CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY(COALESCE(UoMPrices."Currency",'')) = 1 
				THEN UoMPrices."Price" 
				ELSE UoMPrices."Price" * ( SELECT
	 CAST("Rate" AS DECIMAL(10,
	2)) 
					FROM ORTT 
					WHERE CAST("RateDate" AS DATE) = CURRENT_DATE 
					AND "Currency" = ( SELECT
	 "Id" 
						FROM "CLVS_D_MLT_SLT_CURRENCIES_B1SLQuery" 
						WHERE "IsLocal" = 0 
						AND "Id" <> '##' ) ) 
				END AS DECIMAL(18,
	2)) ,
	 0) AS "UnitPrice",
	 COALESCE( CAST( CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY(COALESCE(UoMPrices."Currency",'')) = 1 
				THEN UoMPrices."Price" / ( SELECT
	 CAST("Rate" AS DECIMAL(10,
	2)) 
					FROM ORTT 
					WHERE CAST("RateDate" AS DATE) = CURRENT_DATE 
					AND "Currency" = ( SELECT
	 "Id" 
						FROM "CLVS_D_MLT_SLT_CURRENCIES_B1SLQuery" 
						WHERE "IsLocal" = 0 
						AND "Id" <> '##' ) ) 
				ELSE UoMPrices."Price" 
				END AS DECIMAL(18,
	2)) ,
	 0) AS "UnitPriceFC",
	 UoMPrices."PriceList",
	 UoMMasterData."UomCode",
	 UoMMasterData."UomName",
	 UoMMasterData."UomEntry" AS "UoMEntry",
	 'N' AS "PrchseItem",
	 1 AS "sort_order" 
		FROM "ITM9" UoMPrices 
		INNER JOIN "OUOM" UoMMasterData ON UoMMasterData."UomEntry" = UoMPrices."UomEntry")) WITH READ ONLY;



--192-----------------------------------------------------------192--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_UPCOMINGEXCHANGERATES_B1SLQuery" ( "Rate", "RateDate" ) AS SELECT TOP 30 
CAST("Rate" AS DECIMAL(10,
	2)) AS "Rate",
	CLVS_D_MLT_SLT_DOCFULLDATE(0, "RateDate") AS "RateDate"
FROM "ORTT" 
WHERE "CLVS_D_MLT_SLT_ISLOCALCURRENCY"("Currency") = 0 AND 
CAST("RateDate" AS DATE) 
      BETWEEN CAST(CURRENT_DATE AS DATE) AND ADD_DAYS(CAST(CURRENT_DATE AS DATE), 29) ORDER BY CAST("RateDate" AS DATE) DESC WITH READ ONLY;



--193-----------------------------------------------------------193--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_USERS_B1SLQuery" ( "UserSignature", "Code" ) AS SELECT
	 "INTERNAL_K" AS "UserSignature",
	 "USER_CODE" AS "Code"
FROM "OUSR";



--194-----------------------------------------------------------194--



CREATE VIEW "TST_CL_DEVDEMOCR"."CLVS_D_MLT_SLT_WAREHOUSESBIN_B1SLQuery" ( "AbsEntry", "BinCode", "WhsCode" ) AS SELECT
	 "AbsEntry",
	 "BinCode",
	 "WhsCode" 
FROM "OBIN" 
WHERE "Disabled" = 'N';



--195-----------------------------------------------------------195--


CREATE FUNCTION "CLVS_D_MLT_SLT_ALLOWUNITITEM" (
  ItemCode NVARCHAR(5000)
)
RETURNS Result VARCHAR(5000)
LANGUAGE SQLSCRIPT
SQL SECURITY INVOKER
AS
BEGIN	
	SELECT TOP 1
   		CAST("UomEntry" AS VARCHAR)
	INTO 
		Result
    FROM 
    	ITM12
    WHERE 
    	"ItemCode" = :ItemCode
       	AND 
       	"UomType" = 'S';
END;

CREATE FUNCTION "CLVS_D_MLT_SLT_DISCOUNTGROUPITEM" (
    CardCode VARCHAR(5000),
    ItemCode VARCHAR(5000)
)
RETURNS Discount VARCHAR(5000)
LANGUAGE SQLSCRIPT
AS
BEGIN
    IF :CardCode = '' OR :CardCode IS NULL THEN
           Discount := '0.0';
    ELSE
        SELECT 
        	COALESCE(DiscountGroupItem."Discount", '0.0')
        INTO 
        	Discount
        FROM 
        	OITM AS Items
        	LEFT JOIN
        	(
        		SELECT 
                	BusinessPartner."CardCode", 
                	DiscountGroup."ItemGroup", 
                	DiscountGroup."Discount"
            	FROM 
            		OCRD AS BusinessPartner
            	JOIN 
            		CLVS_D_MLT_SLT_DISCGROUP AS DiscountGroup 
                ON DiscountGroup."CardGroup" = BusinessPartner."CardCode" 
                AND BusinessPartner."CardCode" = :CardCode
        	) AS DiscountGroupItem
            ON 
            (
	            DiscountGroupItem."ItemGroup" IS NULL
	            OR DiscountGroupItem."ItemGroup" = Items."ItmsGrpCod" 
	            OR DiscountGroupItem."ItemGroup" = Items."ItemCode"
            )
            WHERE Items."ItemCode" = :ItemCode;
	END IF;
END;

CREATE FUNCTION CLVS_D_MLT_SLT_DOCFULLDATE (
	IN DocTime SMALLINT,
	IN DocDate SECONDDATE
)
RETURNS DocFullDate NVARCHAR(30)
LANGUAGE SQLSCRIPT
SQL SECURITY INVOKER AS
BEGIN
	
	SELECT TO_NVARCHAR(:DocDate, 'YYYY-MM-DD') || ' ' || TO_VARCHAR(:DocTime, '00:00')
	INTO DocFullDate FROM DUMMY;
	
END;

CREATE FUNCTION "CLVS_D_MLT_SLT_DOWNPAYMENTAPPLIED"
(
DocEntry INTEGER
)
RETURNS Balance DECIMAL
LANGUAGE SQLSCRIPT
AS
BEGIN

SELECT 
SUM( CASE WHEN CLVS_D_MLT_SLT_ISLOCALCURRENCY("ARDownPayment"."DocCur") = 1 
THEN COALESCE(("InvoiceApplied"."DrawnSum" + "InvoiceApplied"."Vat"),0) 
ELSE COALESCE(("InvoiceApplied"."DrawnSumFc" + "InvoiceApplied"."VatFc"),0) 
END ) AS Balance 
INTO Balance
FROM 
ODPI "ARDownPayment" LEFT JOIN INV9 "InvoiceApplied" 
ON "InvoiceApplied"."BaseAbs" = "ARDownPayment"."DocEntry" 
WHERE "ARDownPayment"."DocEntry" = :DocEntry
GROUP BY "ARDownPayment"."DocEntry";
END;

CREATE FUNCTION "CLVS_D_MLT_SLT_ISLOCALCURRENCY"(
    Currency VARCHAR(3)
)
RETURNS IsLocal INTEGER LANGUAGE SQLSCRIPT AS
BEGIN
	
	IF :Currency = '' THEN
		SELECT 1 INTO IsLocal FROM DUMMY;
	ELSE
		SELECT COALESCE(
			(SELECT COALESCE("IsLocal", 1) FROM "CLVS_D_MLT_SLT_CURRENCIES_B1SLQuery" WHERE "Id" = :Currency),
			0
		) INTO IsLocal FROM DUMMY; 
	END IF;
END;

CREATE FUNCTION CLVS_D_MLT_SLT_PARSEDDATE(DocDate DATETIME, DocTime INTEGER)
RETURNS parsedDate VARCHAR(20) LANGUAGE SQLSCRIPT AS
BEGIN
	
	DECLARE hours INT;
    DECLARE minutes INT;
    DECLARE time_string VARCHAR(5);
    
    hours := FLOOR(DocTime / 100);
    minutes := MOD(DocTime, 100);
    
    time_string := TO_NVARCHAR(hours, '00') || ':' || TO_NVARCHAR(minutes, '00');
    
	SELECT
		(
			CAST(:DocDate AS DATE)||' '|| time_string
		)
	INTO parsedDate FROM DUMMY;
END;

CREATE FUNCTION CLVS_D_MLT_SLT_TAXCODE(
	CardCode VARCHAR(100),
	ItemCode VARCHAR(100)
)
RETURNS TaxCode VARCHAR(100)
LANGUAGE SQLSCRIPT
AS
BEGIN
	
	DECLARE TaxCode VARCHAR(100);
	DECLARE OITMValue VARCHAR(100);
	DECLARE OITMGroupNum VARCHAR(100);
	
	-- Buscamos el valor del IVA de artículos
	SELECT 
		COALESCE(
    		(SELECT "U_IVA" FROM "OITM" WHERE "ItemCode" = :ItemCode), 
    		NULL
    	) 
    INTO OITMValue FROM DUMMY;
	
	-- Buscamos el valor del grupo de artículos
	SELECT 
		COALESCE(
    		(SELECT "ItmsGrpCod" FROM "OITM" WHERE "ItemCode" = :ItemCode), 
    		NULL
    	) 
    INTO OITMGroupNum FROM DUMMY;
	
	
	-- Validamos las condiciones existentes, si existe más de una condición es necesario hacer
	-- la validación de abajo o cuantas condiciones se deban validar para este caso
	-- se hace una sola validación pero depende del UDF en socio o ítem
	
	SELECT COALESCE(
		(SELECT "LnTaxCode" FROM "OTCX"
			WHERE "BusArea" = 0 AND
			(
				(
					"Cond1" = 19 AND "UDFTable1" = 'OITM' AND "UDFAlias1" = 'IVA' AND "StrVal1" = :OITMValue
				)
				OR 
				(
				"Cond1" = 10 AND "StrVal1" = :OITMGroupNum
				)
			)
		), NULL)
	INTO TaxCode FROM DUMMY;	
	
	--SELECT 'EXE' INTO TaxCode FROM DUMMY;
END;

CREATE FUNCTION "CLVS_D_MLT_SLT_TAXRATE"
(
	TaxCode VARCHAR(100)
)
RETURNS TaxRate FLOAT
LANGUAGE SQLSCRIPT
AS
BEGIN
	IF :TaxCode = '' THEN
		SELECT 0 INTO TaxRate FROM DUMMY;
	ELSE
		SELECT COALESCE(
			(SELECT CAST(T0."Rate" AS FLOAT) AS "Rate" FROM "OSTC" T0 WHERE T0."Code" = :TaxCode),
			0
		) INTO TaxRate FROM DUMMY;
	END IF;
END;


CREATE FUNCTION "CLVS_D_MLT_SLT_TIMESPAN" (
	DocDate DATE,
	DocTime INT
)
RETURNS timespanInMinutes INT
LANGUAGE SQLSCRIPT
SQL SECURITY INVOKER
AS
BEGIN
	  SELECT CAST((SECONDS_BETWEEN('1970-01-01',TO_SECONDDATE(TO_VARCHAR(:DocDate, 'YYYY-MM-DD') || ' ' || TO_VARCHAR(:DocTime, '00:00:00')))/60) AS INT) INTO timespanInMinutes FROM DUMMY;

END;


CREATE FUNCTION CLVS_D_MLT_SLT_UDF_VALUES (
    IN pTableName NVARCHAR(128),
    IN pColumnCode NVARCHAR(128),
    IN pColumnName NVARCHAR(128)
)
RETURNS TABLE (Code NVARCHAR(5000), Name NVARCHAR(5000)) 
LANGUAGE SQLSCRIPT
SQL SECURITY INVOKER AS
BEGIN

DECLARE sqlQuery NVARCHAR(5000);
DECLARE resultTable TABLE (Code NVARCHAR(5000), Name NVARCHAR(5000)) ;

-- Construct the SQL statement
sqlQuery := 'SELECT ' || :pColumnCode || ' AS Code, ' || :pColumnName || ' AS Name FROM ' || :pTableName;

-- Execute the dynamic SQL and return as a table
EXECUTE IMMEDIATE :sqlQuery INTO resultTable;

RETURN 
	SELECT * FROM :resultTable;

END;