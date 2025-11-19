using System;
using System.Collections.Generic;
using CL.STRUCTURES.ATTRIBUTES;
using CL.STRUCTURES.CLASSES.SAP;
using CL.STRUCTURES.CLASSES.Udf;

namespace CLMLTEMA.MODELS.SAP
{
    /// <summary>
    /// Represents model to business partner
    /// </summary>
    public class BusinessPartners
    {
        /// <summary>
        /// Represent business partner code
        /// </summary>
        [MasterKey] public string CardCode { get; set; }
        
        /// <summary>
        /// Represents business partner group code
        /// </summary>
        public int GroupCode { get; set; }
        
        /// <summary>
        /// Represent business partner name
        /// </summary>
        public string CardName { get; set; }
        
        /// <summary>
        /// Represent type of business partner
        /// </summary>
        public string CardType { get; set; }
        
        /// <summary>
        /// Represent business partner number
        /// </summary>
        ///
        public string Phone1 { get; set; }
        
        /// <summary>
        /// Represents the business partner's payment terms code
        /// </summary>
        public int PayTermsGrpCode { get; set; }
        
        /// <summary>
        /// Represent business partner discount
        /// </summary>
        public decimal DiscountPercent { get; set; }
        
        /// <summary>
        /// Represents limit of the commitment
        /// </summary>
        public decimal MaxCommitment { get; set; }
        
        /// <summary>
        /// Represents identification number of the business partner
        /// </summary>
        public string FederalTaxID { get; set; }
        
        /// <summary>
        /// Represent business partner's price list
        /// </summary>
        public int PriceListNum { get; set; }
        
        /// <summary>
        /// Represent business partner's sales person code
        /// </summary>
        public int SalesPersonCode { get; set; }
        
        /// <summary>
        /// Represent business partner's  currency
        /// </summary>
        public string Currency { get; set; }
        
        /// <summary>
        /// Represent business partner's email
        /// </summary>
        public string EmailAddress { get; set; }
        
        /// <summary>
        /// Represent business partner's serie
        /// </summary>
        public int Series { get; set; }
        
        /// <summary>
        /// Represent cash business partner
        /// </summary>
        public bool CashCustomer { get; set; }
        
        /// <summary>
        /// Represent typeahead format
        /// </summary>
        public string TypeAheadFormat { get; set; }
        
        /// <summary>
        /// Represents type of identification of the business partner
        /// </summary>
        public string TypeIdentification { get; set; }
        
        /// <summary>
        /// Represents province of the business partner
        /// </summary>
        public string Provincia { get; set; }
        
        /// <summary>
        /// Represents canton of the business partner
        /// </summary>
        public string Canton { get; set; }
        
        /// <summary>
        /// Represents distrito of the business partner
        /// </summary>
        public string Distrito { get; set; }
        
        /// <summary>
        /// Represents barrio of the business partner
        /// </summary>
        public string Barrio { get; set; }
        
        /// <summary>
        /// Represents direccion of the business partner
        /// </summary>
        public string Direccion { get; set; }
        
        /// <summary>
        /// Represents status of the business partner
        /// </summary>
        public string Frozen { get; set; } = "tNO";
        
        /// <summary>
        /// Valid address
        /// </summary>
        public string Valid { get; set; } = "tYES";
        
        /// <summary>
        /// Represent parent summary type
        /// </summary>
        public string FatherType { get; set; }
        
        /// <summary>
        /// Represent business partner summary
        /// </summary>
        public string FatherCard  { get; set; }
        
        /// <summary>
        /// Represent fields configurables of view business partner
        /// </summary>
        public List<ConfigurableFields> ConfigurableFields { get; set; }
        
        /// <summary>
        /// Represents business partner address list
        /// </summary>
        public List<BPAddresses> BPAddresses { get; set; }
        
        /// <summary>
        /// Represent user-defined fields
        /// </summary>
        public List<Udf> Udfs { get; set; }
        
        /// <summary>
        /// Represents whether company uses addresses
        /// </summary>
        public bool IsCompanyDirection { get; set; }
        
        /// <summary>
        /// Ship to default address
        /// </summary>
        public string ShipToDefault { get; set; }
        
        /// <summary>
        /// Bill to default address
        /// </summary>
        public string BilltoDefault { get; set; }
        
        /// <summary>
        /// Represent relationship with annexes
        /// </summary>
        public int? AttachmentEntry { get; set; } = 0;
        
        /// <summary>
        /// Property to identify from which device the business partner is created.
        /// </summary>
        public string Device { get; set; }
        
        /// <summary>
        /// Gets or sets the date of the business partner.
        /// </summary>
        public DateTime CreateDate { get; set; }
    }

    public class ConfigurableFields
    {
        public string Description { get; set; }
        public string NameSL { get; set; }
        public string Id { get; set; }
        public string Value { get; set; }
        public bool IsObjDirection { get; set; }
        public string FieldType { get; set; }
    }

    public class BusinessPartnerGroup
    {
        public int Code { get; set; }
        public string Name { get; set; }
    }

    public class BPAddresses
    {
        public string AddressName { get; set; }
        public string Street { get; set; }
        public string Block { get; set; }
        public string ZipCode { get; set; }
        public string City { get; set; }
        public string County { get; set; }
        public string Country { get; set; }
        public string State { get; set; }
        public string AddressType { get; set; }
        public string AddressName2 { get; set; }
        public string AddressName3 { get; set; }
        public string BPCode { get; set; }
        public string GlobalLocationNumber { get; set; }
        public string StreetNo { get; set; }
        public string BuildingFloorRoom { get; set; }
        public int RowNum { get; set; }
        public List<ConfigurableFields> ConfigurableFields { get; set; }
    }


    public class BusinessPartnerLocation
    {
        public int AddressLineNum { get; set; }
        public string Address { get; set; }
        public string Latitude { get; set; }
        public string Longitude { get; set; }
        public Boolean IsDefault { get; set; }
        public string OtherSigns { get; set; }
        public string AddressLineId { get; set; }
        public int AddressType { get; set; }
        public string CardCode { get; set; }
    }

    public class AddressTypes
    {
        public string Code { get; set; }
        public string Name { get; set; }
    }

    public class BusinessPartnerCurrecies
    {
        public string Code { get; set; }
        public string Description { get; set; }
        public bool IsDefault { get; set; }
    }

    public class SociosComercial
    {
        public string Code { get; set; }
        public string Description { get; set; }
        public bool IsDefault { get; set; }
    }

    /// <summary>
    /// Represent the line model of the SAP attachment
    /// </summary>
    public class Attachments2Line
    {
        /// <summary>
        /// The unique identifier of the attachment
        /// </summary>
        public int AbsoluteEntry { get; set; }
        
        /// <summary>
        /// The line number of the attachment
        /// </summary>
        public int LineNum { get; set; }
        /// <summary>
        /// The physical path where the attachment file is stored
        /// </summary>
        public string SourcePath { get; set; }
        /// <summary>
        /// Name of the attachment file
        /// </summary>
        public string FileName { get; set; }
        /// <summary>
        /// The file extension of the attachment
        /// </summary>
        public string FileExtension { get; set; }
        /// <summary>
        /// Last modified date of the attachment
        /// </summary>
        public string AttachmentDate { get; set; }
        /// <summary>
        /// Indicates if should override the attachment file
        /// </summary>
        public string Override { get; set; } = "tYES";
        /// <summary>
        /// Description about attachment file
        /// </summary>
        public string FreeText { get; set; }
    }

    public class Attachments2: DocumentAttachment
    {
        public string CardCode { get; set; }
    }

    public class BPProperties
    {
        public int Id { get; set; }
        public string GroupCode { get; set; }
        public string GroupName { get; set; }
        public string Value { get; set; }
    }

    public class PatchProperties
    {
        [MasterKey] public string CardCode { get; set; }
        public List<BPProperties> PropertiesList { get; set; }
    }

    public class BPProperty
    {
        public string Properties1 { get; set; }
        public string Properties2 { get; set; }
        public string Properties3 { get; set; }
        public string Properties4 { get; set; }
        public string Properties5 { get; set; }
        public string Properties6 { get; set; }
        public string Properties7 { get; set; }
        public string Properties8 { get; set; }
        public string Properties9 { get; set; }
        public string Properties10 { get; set; }
        public string Properties11 { get; set; }
        public string Properties12 { get; set; }
        public string Properties13 { get; set; }
        public string Properties14 { get; set; }
        public string Properties15 { get; set; }
        public string Properties16 { get; set; }
        public string Properties17 { get; set; }
        public string Properties18 { get; set; }
        public string Properties19 { get; set; }
        public string Properties20 { get; set; }
        public string Properties21 { get; set; }
        public string Properties22 { get; set; }
        public string Properties23 { get; set; }
        public string Properties24 { get; set; }
        public string Properties25 { get; set; }
        public string Properties26 { get; set; }
        public string Properties27 { get; set; }
        public string Properties28 { get; set; }
        public string Properties29 { get; set; }
        public string Properties30 { get; set; }
        public string Properties31 { get; set; }
        public string Properties32 { get; set; }
        public string Properties33 { get; set; }
        public string Properties34 { get; set; }
        public string Properties35 { get; set; }
        public string Properties36 { get; set; }
        public string Properties37 { get; set; }
        public string Properties38 { get; set; }
        public string Properties39 { get; set; }
        public string Properties40 { get; set; }
        public string Properties41 { get; set; }
        public string Properties42 { get; set; }
        public string Properties43 { get; set; }
        public string Properties44 { get; set; }
        public string Properties45 { get; set; }
        public string Properties46 { get; set; }
        public string Properties47 { get; set; }
        public string Properties48 { get; set; }
        public string Properties49 { get; set; }
        public string Properties50 { get; set; }
        public string Properties51 { get; set; }
        public string Properties52 { get; set; }
        public string Properties53 { get; set; }
        public string Properties54 { get; set; }
        public string Properties55 { get; set; }
        public string Properties56 { get; set; }
        public string Properties57 { get; set; }
        public string Properties58 { get; set; }
        public string Properties59 { get; set; }
        public string Properties60 { get; set; }
        public string Properties61 { get; set; }
        public string Properties62 { get; set; }
        public string Properties63 { get; set; }
        public string Properties64 { get; set; }
    }

    /// <summary>
    /// Business partner on MAG data update
    /// </summary>
    public class BusinessPartnersWithMag
    {
        /// <summary>
        /// CardCode of the business partner
        /// </summary>
        [MasterKey] public string CardCode { get; set; }
        /// <summary>
        /// CardName of the business partner
        /// </summary>
        public string CardName { get; set; }
        /// <summary>
        /// Expiration date on MAG
        /// </summary>
        public DateTime? U_MagVencimiento { get; set; }
        /// <summary>
        /// To be or not to be inscribe on MAG 1 = yes | 2 = no
        /// </summary>
        public string U_NVT_InscMAG { get; set; }
        /// <summary>
        /// Identification number of the business partner
        /// </summary>
        public string FederalTaxID { get; set; }
        /// <summary>
        //
        /// </summary>
        public DateTime? U_EMA_MAGUpdateDate { get; set; }
    }

    public class Mag
    {
        public string nombreMAG { get; set; }
        public string estadoMAG { get; set; }
        public string fechaBajaMAG { get; set; }
        public bool indicadorActivoMAG { get; set; }
        public string fechaAltaMAG { get; set; }
        public string fuenteMAG { get; set; }
    }

    /// <summary>
    /// Activate business parner
    /// </summary>
    public class BusinessPartnersActivate
    {
        /// <summary>
        /// Represent business partner code
        /// </summary>
        [MasterKey] public string CardCode { get; set; }
        
        /// <summary>
        /// Activate BusinessPartner
        /// </summary>
        public string Valid { get; set; } = "tYES";
        
        /// <summary>
        /// Represents status of the business partner
        /// </summary>
        public string Frozen { get; set; } = "tNO";
        
 
    }
}