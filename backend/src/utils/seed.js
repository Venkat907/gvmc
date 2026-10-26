const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const { connectDB, disconnectDB } = require('../config/db');
const Admin = require('../models/Admin');
const Dataset = require('../models/Dataset');
const ActivityLog = require('../models/ActivityLog');
const { parseDataFile } = require('./fileParser');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 1. Water Supply CSV Content
const waterCsvData = `Date,Reservoir_Name,Design_Capacity_MCFT,Current_Level_FT,Full_Reservoir_Level_FT,Daily_Inflow_Cusecs,Daily_Outflow_MLD,Water_Quality_TDS_PPM,Zone_Coverage,Operational_Status
2024-10-01,Mudharasarlova,23.5,18.4,21.0,42.5,16.2,210,Zone 2 (Hanumanthawaka & Maddilapalem),Normal
2024-10-01,Gambhiram,45.0,38.2,42.0,85.0,28.5,195,Zone 1 (Madhurawada & Rushikonda),Normal
2024-10-01,Raiwada,360.0,295.4,310.0,310.0,140.0,180,Zone 3 & 4 (Central Visakhapatnam & Dwaraka Nagar),Optimal
2024-10-01,Thatipudi,112.5,96.8,105.0,195.0,72.0,175,Zone 5 & 6 (Gajuwaka & Industrial Corridor),Normal
2024-10-01,Meghadrigedda,105.0,82.4,94.0,140.0,55.0,230,Zone 7 & 8 (Pendurthi & Gopalapatnam),Maintenance
2024-10-02,Mudharasarlova,23.5,18.6,21.0,45.0,16.0,212,Zone 2 (Hanumanthawaka & Maddilapalem),Normal
2024-10-02,Gambhiram,45.0,38.5,42.0,88.0,28.0,190,Zone 1 (Madhurawada & Rushikonda),Normal
2024-10-02,Raiwada,360.0,296.1,310.0,305.0,142.0,182,Zone 3 & 4 (Central Visakhapatnam & Dwaraka Nagar),Optimal
2024-10-02,Thatipudi,112.5,97.2,105.0,190.0,71.5,178,Zone 5 & 6 (Gajuwaka & Industrial Corridor),Normal
2024-10-02,Meghadrigedda,105.0,83.1,94.0,145.0,54.5,228,Zone 7 & 8 (Pendurthi & Gopalapatnam),Normal
2024-10-03,Mudharasarlova,23.5,18.9,21.0,48.0,16.5,215,Zone 2 (Hanumanthawaka & Maddilapalem),Normal
2024-10-03,Gambhiram,45.0,38.9,42.0,92.0,29.0,188,Zone 1 (Madhurawada & Rushikonda),Optimal
2024-10-03,Raiwada,360.0,297.0,310.0,318.0,145.0,185,Zone 3 & 4 (Central Visakhapatnam & Dwaraka Nagar),Optimal
2024-10-03,Thatipudi,112.5,97.8,105.0,198.0,72.5,176,Zone 5 & 6 (Gajuwaka & Industrial Corridor),Normal
2024-10-03,Meghadrigedda,105.0,83.8,94.0,150.0,56.0,225,Zone 7 & 8 (Pendurthi & Gopalapatnam),Normal
2024-10-04,Mudharasarlova,23.5,19.1,21.0,50.0,16.8,210,Zone 2 (Hanumanthawaka & Maddilapalem),Normal
2024-10-04,Gambhiram,45.0,39.2,42.0,95.0,29.5,185,Zone 1 (Madhurawada & Rushikonda),Optimal
2024-10-04,Raiwada,360.0,298.2,310.0,325.0,146.0,180,Zone 3 & 4 (Central Visakhapatnam & Dwaraka Nagar),Optimal
2024-10-04,Thatipudi,112.5,98.1,105.0,202.0,73.0,172,Zone 5 & 6 (Gajuwaka & Industrial Corridor),Normal
2024-10-04,Meghadrigedda,105.0,84.2,94.0,152.0,56.5,222,Zone 7 & 8 (Pendurthi & Gopalapatnam),Normal`;

// 2. Waste Management CSV Content
const wasteCsvData = `Ward_Number,Zone,Households_Count,Wet_Waste_MT_Daily,Dry_Waste_MT_Daily,Domestic_Hazardous_KG,Door_To_Door_Coverage_Percent,Segregation_Compliance_Percent,Kapuluppada_Disposal_MT,Processing_Unit
Ward 1,Zone 1,4850,5.8,4.2,140,96.5,88.4,8.5,WTE Plant & Composting
Ward 2,Zone 1,5120,6.1,4.5,160,98.0,91.2,9.1,WTE Plant & Composting
Ward 12,Zone 2,6420,7.9,5.8,210,95.0,85.0,11.8,Material Recovery Facility (MRF)
Ward 15,Zone 2,5800,7.2,5.1,190,97.2,87.6,10.6,MRF & Biomethanation
Ward 24,Zone 3,7100,9.4,6.9,280,99.1,93.5,14.2,Kapuluppada WTE Facility
Ward 28,Zone 3,6800,8.8,6.4,260,98.5,92.0,13.5,Kapuluppada WTE Facility
Ward 35,Zone 4,5950,7.5,5.3,185,96.0,86.2,11.0,Biomethanation Unit
Ward 42,Zone 4,6300,8.1,5.9,205,97.4,88.0,12.2,MRF Facility
Ward 51,Zone 5,8200,11.2,8.4,340,94.2,81.5,17.4,WTE Co-processing
Ward 58,Zone 5,7900,10.8,8.0,320,95.0,83.0,16.5,WTE Co-processing
Ward 65,Zone 6,6700,8.6,6.2,240,96.8,86.9,13.0,Refuse-Derived Fuel (RDF)
Ward 72,Zone 7,5400,6.7,4.8,170,95.5,84.2,10.1,Decentralized Composting
Ward 84,Zone 8,6100,7.8,5.5,195,96.2,85.8,11.7,Decentralized Composting
Ward 92,Zone 8,5650,7.1,5.0,180,97.0,87.1,10.5,Decentralized Composting`;

// 3. Road Maintenance CSV Content
const roadCsvData = `Grievance_ID,Corridor_Name,Zone,Ward_No,Road_Classification,Pothole_Area_SqM,Report_Date,Target_Completion,Current_Status,Material_Used,Approved_Budget_INR
GVM-RD-2024-001,Beach Road Coastal Promenade,Zone 3,Ward 24,Major Arterial,18.5,2024-09-15,2024-09-22,Completed,Stone Mastic Asphalt (SMA),145000
GVM-RD-2024-002,NH16 Service Road Isukathota,Zone 2,Ward 14,Sub-Arterial,32.0,2024-09-18,2024-09-28,Completed,Bituminous Concrete (BC),280000
GVM-RD-2024-003,BRTS Corridor Asilmetta-Siripuram,Zone 3,Ward 28,Transit Corridor,14.2,2024-09-22,2024-09-29,Completed,Cold Mix Asphalt,115000
GVM-RD-2024-004,Gajuwaka Main Market Corridor,Zone 5,Ward 52,Collector Road,45.0,2024-09-25,2024-10-08,In-Progress,Dense Bituminous Macadam,390000
GVM-RD-2024-005,Madhurawada IT SEZ Access Road,Zone 1,Ward 4,Collector Road,22.8,2024-09-28,2024-10-10,In-Progress,Polymer Modified Bitumen,195000
GVM-RD-2024-006,Pendurthi Junction Bypass,Zone 7,Ward 71,Sub-Arterial,54.0,2024-10-01,2024-10-15,Scheduled,Cement Concrete Paving,480000
GVM-RD-2024-007,Town Hall Heritage Stretch,Zone 4,Ward 38,Local Street,12.0,2024-10-02,2024-10-09,Completed,Interlocking Paver Blocks,95000
GVM-RD-2024-008,NAD Flyover Underpass Service Lane,Zone 6,Ward 63,Arterial Service,38.5,2024-10-04,2024-10-18,In-Progress,Bituminous Concrete,320000
GVM-RD-2024-009,Rushikonda Beach View Link Road,Zone 1,Ward 2,Tourist Arterial,16.4,2024-10-05,2024-10-14,Completed,Micro-surfacing Slurry,135000
GVM-RD-2024-010,Kurmannapalem Steel City Sector 4,Zone 5,Ward 58,Sub-Arterial,29.0,2024-10-06,2024-10-20,Scheduled,Cold Mix Asphalt,240000`;

// 4. Public Health CSV Content
const healthCsvData = `UPHC_Code,Facility_Name,Zone,Ward_No,Medical_Officers,Daily_Average_OPD,Maternal_Care_ANC_Monthly,Child_Immunization_Monthly,Lab_Diagnostics_Available,Emergency_Services_24x7,Telemedicine_Facility
UPHC-01,Madhurawada Central UPHC,Zone 1,Ward 3,2,145,210,185,Yes (32 Parameters),No,Yes
UPHC-02,Rushikonda Beach UPHC,Zone 1,Ward 2,1,92,120,110,Yes (24 Parameters),No,Yes
UPHC-03,Seethammadhara Health Post,Zone 2,Ward 16,2,168,245,220,Yes (42 Parameters),Yes,Yes
UPHC-04,Maddilapalem Community Health,Zone 2,Ward 19,2,185,260,240,Yes (42 Parameters),Yes,Yes
UPHC-05,Jagadamba Junction Primary Post,Zone 3,Ward 26,3,230,310,295,Yes (50 Parameters),Yes,Yes
UPHC-06,Dwaraka Nagar Urban Health Unit,Zone 3,Ward 30,2,190,270,250,Yes (42 Parameters),Yes,Yes
UPHC-07,Poorana Market Dispensary,Zone 4,Ward 37,2,155,225,205,Yes (32 Parameters),No,Yes
UPHC-08,One Town Port Health Centre,Zone 4,Ward 41,2,140,195,180,Yes (32 Parameters),No,Yes
UPHC-09,Gajuwaka Industrial UPHC,Zone 5,Ward 53,3,245,340,320,Yes (50 Parameters),Yes,Yes
UPHC-10,Sriharipuram Civic Clinic,Zone 5,Ward 57,2,175,230,215,Yes (42 Parameters),No,Yes
UPHC-11,Mindi Colony Dispensary,Zone 6,Ward 66,1,110,140,135,Yes (24 Parameters),No,Yes
UPHC-12,Gopalapatnam Urban Clinic,Zone 7,Ward 74,2,165,215,200,Yes (32 Parameters),No,Yes
UPHC-13,Pendurthi Main Health Centre,Zone 7,Ward 79,2,180,250,230,Yes (42 Parameters),Yes,Yes
UPHC-14,Aganampudi Health Post,Zone 8,Ward 88,1,115,150,140,Yes (24 Parameters),No,Yes`;

// 5. Transit JSON Content
const transitJsonData = [
  {
    routeNumber: "28A",
    routeName: "RK Beach to Simhachalam Foothills",
    origin: "RK Beach (Coastal Marine Drive)",
    destination: "Simhachalam Temple Bus Complex",
    transitMode: "BRTS & City Express",
    totalDistanceKm: 18.5,
    averageTripMinutes: 42,
    fleetType: "Electric Buses (12m Low-Floor)",
    dailyTrips: 72,
    peakFrequencyMins: 8,
    offPeakFrequencyMins: 15,
    averageDailyRidership: 14200,
    fareRangeINR: "10 - 35",
    keyStops: ["RK Beach", "Siripuram", "RTC Complex", "Gurudwara Junction", "NAD Kotha Road", "Simhachalam"]
  },
  {
    routeNumber: "38K",
    routeName: "Kurmannapalem to Madhurawada IT Park",
    origin: "Steel Plant Township (Kurmannapalem)",
    destination: "Hill 3 IT SEZ Madhurawada",
    transitMode: "Corridor Express",
    totalDistanceKm: 34.2,
    averageTripMinutes: 65,
    fleetType: "Electric AC Bus",
    dailyTrips: 48,
    peakFrequencyMins: 12,
    offPeakFrequencyMins: 20,
    averageDailyRidership: 9850,
    fareRangeINR: "15 - 55",
    keyStops: ["Kurmannapalem", "Gajuwaka", "NAD Flyover", "Gurudwara", "Maddilapalem", "Hanumanthawaka", "Madhurawada IT SEZ"]
  },
  {
    routeNumber: "400",
    routeName: "Visakhapatnam Railway Station to Bheemunipatnam",
    origin: "Visakhapatnam Central Railway Station",
    destination: "Bheemili Dutch Town Hub",
    transitMode: "Scenic Coastal Transit",
    totalDistanceKm: 31.0,
    averageTripMinutes: 58,
    fleetType: "Clean CNG / Hybrid",
    dailyTrips: 36,
    peakFrequencyMins: 15,
    offPeakFrequencyMins: 25,
    averageDailyRidership: 7100,
    fareRangeINR: "15 - 45",
    keyStops: ["Station", "Dwaraka Bus Station", "Siripuram", "Rushikonda Beach", "Thimmapuram", "Mangamaripeta", "Bheemunipatnam"]
  },
  {
    routeNumber: "6A",
    routeName: "Old Post Office (One Town) to Pendurthi",
    origin: "One Town Heritage Market",
    destination: "Pendurthi Junction Depot",
    transitMode: "Suburban Transit",
    totalDistanceKm: 22.0,
    averageTripMinutes: 50,
    fleetType: "Diesel BS-VI",
    dailyTrips: 54,
    peakFrequencyMins: 10,
    offPeakFrequencyMins: 18,
    averageDailyRidership: 11200,
    fareRangeINR: "10 - 35",
    keyStops: ["One Town", "Port Area", "Convent Junction", "Kancharapalem", "NAD", "Gopalapatnam", "Pendurthi"]
  },
  {
    routeNumber: "999",
    routeName: "Visakhapatnam Airport Shuttle Express",
    origin: "Visakhapatnam International Airport (VTZ)",
    destination: "Rushikonda IT Hills",
    transitMode: "Airport Non-Stop Link",
    totalDistanceKm: 26.5,
    averageTripMinutes: 45,
    fleetType: "Premium Electric AC Low-Floor",
    dailyTrips: 32,
    peakFrequencyMins: 30,
    offPeakFrequencyMins: 45,
    averageDailyRidership: 3400,
    fareRangeINR: "50 - 100",
    keyStops: ["Airport Terminal", "NAD Flyover", "RTC Complex", "Siripuram", "Park Hotel", "Rushikonda SEZ"]
  }
];

// 6. Property Tax CSV Content
const taxCsvData = `Zone_ID,Zone_Name,Total_Registered_Properties,Residential_Properties,Commercial_Properties,Industrial_Properties,Annual_Demand_INR_Crores,Collected_Q1_Q2_INR_Crores,Collection_Efficiency_Percent,Digital_Payment_Adoption_Percent,Pending_Notices_Issued
Zone 1,Madhurawada & Rushikonda,38400,32100,5900,400,42.5,33.8,79.5,88.4,2450
Zone 2,Asilmetta & Maddilapalem,42100,34200,7500,400,68.2,56.4,82.7,85.2,1920
Zone 3,Central Dwaraka Nagar & Beach,35600,24800,10500,300,84.5,73.1,86.5,91.0,1410
Zone 4,One Town Heritage & Harbour,28900,20500,8100,300,38.9,30.2,77.6,72.4,3100
Zone 5,Gajuwaka Industrial Hub,46200,36800,8100,1300,76.4,61.8,80.9,78.5,3650
Zone 6,BHPV & Airport Corridor,31200,25600,4900,700,34.8,27.5,79.0,76.8,2180
Zone 7,Pendurthi & Gopalapatnam,37800,32400,5100,300,32.1,24.8,77.3,74.2,2890
Zone 8,Anakapalle West & Aganampudi,29500,24900,4200,400,24.5,18.7,76.3,69.5,2740`;

// 7. Environment Air Quality CSV Content
const aqiCsvData = `Station_ID,Station_Location,Zone,Date,PM2_5_ug_m3,PM10_ug_m3,Sulphur_Dioxide_SO2_ug_m3,Nitrogen_Dioxide_NO2_ug_m3,Carbon_Monoxide_CO_mg_m3,Ozone_O3_ug_m3,Ambient_Noise_Day_dB,Air_Quality_Index_AQI,AQI_Category
AQI-01,Ramakrishna Beach Promenade,Zone 3,2024-10-01,24.5,48.2,8.4,14.2,0.6,32.5,58.4,52,Satisfactory
AQI-02,Gajuwaka Industrial Crossroads,Zone 5,2024-10-01,68.4,142.0,24.8,38.5,1.8,45.0,74.2,148,Moderate
AQI-03,Madhurawada IT Hill 3,Zone 1,2024-10-01,18.2,36.5,6.2,11.0,0.4,28.4,49.5,41,Good
AQI-04,Siripuram Civic Circle,Zone 3,2024-10-01,42.0,85.4,14.5,28.0,1.1,38.0,68.9,92,Satisfactory
AQI-05,Port Trust Conveyor Boundary,Zone 4,2024-10-01,76.8,165.2,28.5,44.2,2.1,51.0,76.8,162,Moderate
AQI-06,NAD Flyover Interchange,Zone 6,2024-10-01,58.2,118.0,19.4,34.8,1.5,41.2,78.5,124,Moderate
AQI-01,Ramakrishna Beach Promenade,Zone 3,2024-10-02,22.1,45.0,7.9,13.8,0.5,30.8,57.8,48,Good
AQI-02,Gajuwaka Industrial Crossroads,Zone 5,2024-10-02,72.1,148.5,26.2,40.1,1.9,46.2,75.0,154,Moderate
AQI-03,Madhurawada IT Hill 3,Zone 1,2024-10-02,19.5,38.0,6.5,11.8,0.4,29.1,50.2,44,Good
AQI-04,Siripuram Civic Circle,Zone 3,2024-10-02,44.5,88.2,15.1,29.4,1.2,39.5,69.5,96,Satisfactory
AQI-05,Port Trust Conveyor Boundary,Zone 4,2024-10-02,79.4,171.0,29.8,46.0,2.2,53.4,77.4,168,Moderate
AQI-06,NAD Flyover Interchange,Zone 6,2024-10-02,61.0,122.5,20.5,36.2,1.6,42.8,79.1,130,Moderate`;

// 8. Urban Planning Master Plan JSON Content
const planningJsonData = [
  {
    zoningCode: "R-1",
    zoneClassification: "Primary Low-Density Residential",
    permittedUses: ["Single Family Bungalows", "Villa Developments", "Neighborhood Parks", "Pre-primary Schools"],
    maxFloorAreaRatio: 1.5,
    maxBuildingHeightMeters: 15.0,
    mandatoryGreenSpacePercent: 15,
    applicableAreas: ["Bheemili Coastal Enclave", "Rushikonda Slopes", "Madhurawada Valley"],
    crzRestrictionApplies: true,
    guidelineDocumentRef: "GVMC-MP2030-VOL2-SEC4.1"
  },
  {
    zoningCode: "R-2",
    zoneClassification: "Multi-Family Medium-to-High Density Residential",
    permittedUses: ["Apartment Complexes", "Gated Communities", "Community Clinics", "Convenience Retail"],
    maxFloorAreaRatio: 2.5,
    maxBuildingHeightMeters: 45.0,
    mandatoryGreenSpacePercent: 12,
    applicableAreas: ["Seethammadhara", "Yendada", "Kommadi", "Gopalapatnam"],
    crzRestrictionApplies: false,
    guidelineDocumentRef: "GVMC-MP2030-VOL2-SEC4.2"
  },
  {
    zoningCode: "C-1",
    zoneClassification: "Central Commercial & Business District",
    permittedUses: ["Corporate Towers", "Shopping Malls", "Hotels & Multiplexes", "FinTech Centers"],
    maxFloorAreaRatio: 3.5,
    maxBuildingHeightMeters: 75.0,
    mandatoryGreenSpacePercent: 10,
    applicableAreas: ["Dwaraka Nagar", "Asilmetta", "Siripuram", "Waltair Uplands"],
    crzRestrictionApplies: false,
    guidelineDocumentRef: "GVMC-MP2030-VOL2-SEC5.1"
  },
  {
    zoningCode: "I-2",
    zoneClassification: "Special Industrial & Heavy Manufacturing Hub",
    permittedUses: ["Manufacturing Units", "Heavy Fabrication", "Logistics Warehousing", "Ancillary Engineering"],
    maxFloorAreaRatio: 1.8,
    maxBuildingHeightMeters: 24.0,
    mandatoryGreenSpacePercent: 20,
    applicableAreas: ["Autonagar Gajuwaka", "BHPV Corridor", "Duvvada Logistics Hub"],
    crzRestrictionApplies: false,
    guidelineDocumentRef: "GVMC-MP2030-VOL2-SEC6.3"
  },
  {
    zoningCode: "EC-1",
    zoneClassification: "Eco-Sensitive Coastal Tourism & Heritage Corridor",
    permittedUses: ["Eco-Resorts", "Marine Research Centers", "Public Beach Promenades", "Mangrove Sanctuaries"],
    maxFloorAreaRatio: 0.75,
    maxBuildingHeightMeters: 9.0,
    mandatoryGreenSpacePercent: 35,
    applicableAreas: ["RK Beach Corridor", "Thotlakonda Foot-hills", "Bavikonda Buffer Zone", "Kambalakonda Verge"],
    crzRestrictionApplies: true,
    guidelineDocumentRef: "GVMC-MP2030-VOL3-CRZ-SPECIAL"
  }
];

// Helper to write file safely
const writeUploadedFile = (filename, content) => {
  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, content, 'utf-8');
  const stats = fs.statSync(filePath);
  return { filePath, fileSize: stats.size };
};

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    // 1. Seed or Verify Default Admin
    const defaultEmail = (process.env.DEFAULT_ADMIN_EMAIL || 'admin@gvmc.gov.in').toLowerCase();
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@12345';
    const defaultName = process.env.DEFAULT_ADMIN_NAME || 'GVMC Data Administrator';

    let admin = await Admin.findOne({ email: defaultEmail });
    if (!admin) {
      const passwordHash = await Admin.hashPassword(defaultPassword);
      admin = await Admin.create({
        username: 'gvmc_admin',
        email: defaultEmail,
        passwordHash,
        name: defaultName,
        role: 'superadmin',
      });
      console.log(`[Seed] Created default Administrator: ${defaultEmail} (Password: ${defaultPassword})`);
    } else {
      console.log(`[Seed] Admin user already exists: ${defaultEmail}`);
    }

    // 2. Prepare Physical Demo Files in uploads directory
    console.log('[Seed] Writing demonstration dataset files to uploads folder...');
    const file1 = writeUploadedFile('gvmc_water_supply_levels_2024.csv', waterCsvData);
    const file2 = writeUploadedFile('gvmc_waste_management_ward_metrics.csv', wasteCsvData);
    const file3 = writeUploadedFile('gvmc_road_maintenance_pothole_repairs.csv', roadCsvData);
    const file4 = writeUploadedFile('gvmc_uphc_footfall_immunization.csv', healthCsvData);
    const file5 = writeUploadedFile('gvmc_city_bus_transit_routes.json', JSON.stringify(transitJsonData, null, 2));
    const file6 = writeUploadedFile('gvmc_property_tax_collection_2023_24.csv', taxCsvData);
    const file7 = writeUploadedFile('gvmc_ambient_air_quality_zones.csv', aqiCsvData);
    const file8 = writeUploadedFile('gvmc_master_plan_land_use_registry.json', JSON.stringify(planningJsonData, null, 2));

    // 3. Define Demo Datasets Metadata
    const sampleDatasets = [
      {
        title: 'GVMC Daily Water Supply & Reservoir Storage Levels (2024)',
        description: 'Comprehensive daily reservoir storage levels (FRL vs current level in feet), inflow rates in cusecs, daily pumped outflow in Million Litres per Day (MLD), water quality TDS readings, and zonal coverage across major municipal reservoirs including Mudharasarlova, Gambhiram, Raiwada, Thatipudi, and Meghadrigedda.',
        category: 'Water Supply',
        department: 'Water Supply and Underground Drainage Engineering Department',
        keywords: ['water supply', 'reservoir', 'raiwada', 'mld', 'drinking water', 'dam levels', 'water security'],
        sourceUrl: 'https://gvmc.gov.in/water-supply-reports',
        publicationDate: new Date('2024-01-15'),
        lastUpdated: new Date('2024-10-05'),
        fileFormat: 'CSV',
        filePath: file1.filePath,
        originalFileName: 'gvmc_water_supply_levels_2024.csv',
        fileSize: file1.fileSize,
        license: 'Government Open Data License - India (GODL) / CC-BY-4.0',
        status: 'published',
        downloadCount: 342,
        isDemoData: true,
      },
      {
        title: 'Ward-wise Municipal Solid Waste Generation & Segregation Metrics',
        description: 'Zone and ward-level data tracking daily household wet waste, dry recyclable waste, and domestic hazardous waste collection. Includes door-to-door collection coverage percentages, source segregation compliance rates, and disposal tonnage sent to Kapuluppada waste-to-energy processing plants.',
        category: 'Waste Management',
        department: 'Public Health & Municipal Solid Waste Department',
        keywords: ['solid waste', 'segregation', 'recycling', 'kapuluppada', 'garbage collection', 'sanitation'],
        sourceUrl: 'https://gvmc.gov.in/solid-waste-management',
        publicationDate: new Date('2024-02-10'),
        lastUpdated: new Date('2024-09-30'),
        fileFormat: 'CSV',
        filePath: file2.filePath,
        originalFileName: 'gvmc_waste_management_ward_metrics.csv',
        fileSize: file2.fileSize,
        license: 'Government Open Data License - India (GODL) / CC-BY-4.0',
        status: 'published',
        downloadCount: 285,
        isDemoData: true,
      },
      {
        title: 'Road Infrastructure & Pothole Redressal Status Register',
        description: 'Civil works register tracking citizen grievance reports and municipal inspections for road maintenance across Beach Road, NH-16 service lines, and BRTS transit corridors. Details road classification, pothole repair square-meter coverage, patching materials used, approved municipal budget, and completion status.',
        category: 'Roads and Infrastructure',
        department: 'Civil Engineering & Roads Maintenance Wing',
        keywords: ['roads', 'pothole', 'civil works', 'asphalt', 'infrastructure', 'grievance', 'maintenance'],
        sourceUrl: 'https://gvmc.gov.in/engineering-works',
        publicationDate: new Date('2024-03-20'),
        lastUpdated: new Date('2024-10-06'),
        fileFormat: 'CSV',
        filePath: file3.filePath,
        originalFileName: 'gvmc_road_maintenance_pothole_repairs.csv',
        fileSize: file3.fileSize,
        license: 'Government Open Data License - India (GODL) / CC-BY-4.0',
        status: 'published',
        downloadCount: 198,
        isDemoData: true,
      },
      {
        title: 'Urban Primary Health Centres (UPHC) OPD & Immunization Statistics',
        description: 'Monthly and daily operational dataset for municipal health facilities across Visakhapatnam urban agglomeration. Covers medical officer staffing, daily outpatient (OPD) patient footfalls, antenatal maternal care (ANC) visits, universal child immunization coverage, lab diagnostic capacities, and telemedicine adoption.',
        category: 'Public Health',
        department: 'Chief Medical Officer of Health (CMOH)',
        keywords: ['health', 'uphc', 'opd', 'immunization', 'maternal care', 'clinics', 'telemedicine'],
        sourceUrl: 'https://gvmc.gov.in/health-services',
        publicationDate: new Date('2024-04-05'),
        lastUpdated: new Date('2024-09-28'),
        fileFormat: 'CSV',
        filePath: file4.filePath,
        originalFileName: 'gvmc_uphc_footfall_immunization.csv',
        fileSize: file4.fileSize,
        license: 'Government Open Data License - India (GODL) / CC-BY-4.0',
        status: 'published',
        downloadCount: 412,
        isDemoData: true,
      },
      {
        title: 'Visakhapatnam City Bus & BRTS Public Transit Network Routes',
        description: 'Comprehensive transit network route inventory encompassing major city bus services, BRTS express corridors, and airport express routes connecting Bheemili, Pendurthi, Gajuwaka, and IT corridors. Contains route distances, average travel durations, fleet electrification status, trip frequencies, and daily passenger ridership.',
        category: 'Transportation',
        department: 'Urban Transport & Traffic Planning Division',
        keywords: ['transit', 'bus routes', 'electric buses', 'brts', 'ridership', 'traffic', 'mobility'],
        sourceUrl: 'https://gvmc.gov.in/urban-transport',
        publicationDate: new Date('2024-05-18'),
        lastUpdated: new Date('2024-10-02'),
        fileFormat: 'JSON',
        filePath: file5.filePath,
        originalFileName: 'gvmc_city_bus_transit_routes.json',
        fileSize: file5.fileSize,
        license: 'Government Open Data License - India (GODL) / CC-BY-4.0',
        status: 'published',
        downloadCount: 520,
        isDemoData: true,
      },
      {
        title: 'Zone-wise Property Tax Demand & Digital Revenue Collection Performance',
        description: 'Municipal tax assessment ledger detailing registered residential, commercial, and industrial property counts across 8 administrative zones. Tracks annual tax demand in crores, year-to-date collection figures, collection efficiency percentages, digital payment penetration, and recovery notices.',
        category: 'Revenue and Taxation',
        department: 'Revenue & Property Tax Assessment Department',
        keywords: ['property tax', 'revenue', 'taxation', 'digital payments', 'assessments', 'municipal finance'],
        sourceUrl: 'https://gvmc.gov.in/property-tax',
        publicationDate: new Date('2024-06-12'),
        lastUpdated: new Date('2024-09-25'),
        fileFormat: 'CSV',
        filePath: file6.filePath,
        originalFileName: 'gvmc_property_tax_collection_2023_24.csv',
        fileSize: file6.fileSize,
        license: 'Government Open Data License - India (GODL) / CC-BY-4.0',
        status: 'published',
        downloadCount: 310,
        isDemoData: true,
      },
      {
        title: 'Continuous Ambient Air Quality Index (AQI) & Noise Monitoring Across Zones',
        description: 'Environmental telemetry recorded from Continuous Ambient Air Quality Monitoring Stations (CAAQMS) positioned along industrial hubs, coastal promenades, transit junctions, and residential sectors. Captures PM2.5, PM10, SO2, NO2, ambient noise decibel levels, and composite AQI ratings.',
        category: 'Environment',
        department: 'Environmental Protection & Pollution Monitoring Cell',
        keywords: ['air quality', 'aqi', 'pm2.5', 'pollution', 'noise levels', 'gajuwaka', 'beach road', 'ecology'],
        sourceUrl: 'https://gvmc.gov.in/environment-monitoring',
        publicationDate: new Date('2024-07-01'),
        lastUpdated: new Date('2024-10-04'),
        fileFormat: 'CSV',
        filePath: file7.filePath,
        originalFileName: 'gvmc_ambient_air_quality_zones.csv',
        fileSize: file7.fileSize,
        license: 'Government Open Data License - India (GODL) / CC-BY-4.0',
        status: 'published',
        downloadCount: 630,
        isDemoData: true,
      },
      {
        title: 'GVMC Master Plan 2030 Land Use Zoning & Development Permissions Registry',
        description: 'Spatial zoning classification norms based on the Visakhapatnam Metropolitan Master Plan 2030. Specifies permitted civic activities, permissible Floor Area Ratios (FAR / FSI), maximum permissible building heights, mandatory open green space mandates, and Coastal Regulation Zone (CRZ) statutory guidelines.',
        category: 'Urban Planning',
        department: 'Town Planning & Metropolitan Development Directorate',
        keywords: ['master plan', 'zoning', 'far', 'building permissions', 'land use', 'crz', 'urban development'],
        sourceUrl: 'https://gvmc.gov.in/town-planning',
        publicationDate: new Date('2024-08-14'),
        lastUpdated: new Date('2024-10-01'),
        fileFormat: 'JSON',
        filePath: file8.filePath,
        originalFileName: 'gvmc_master_plan_land_use_registry.json',
        fileSize: file8.fileSize,
        license: 'Government Open Data License - India (GODL) / CC-BY-4.0',
        status: 'published',
        downloadCount: 475,
        isDemoData: true,
      },
    ];

    // 4. Save Datasets to MongoDB with parsed sample rows & columns
    console.log('[Seed] Seeding sample datasets to MongoDB...');
    for (const item of sampleDatasets) {
      const existing = await Dataset.findOne({ title: item.title });
      if (!existing) {
        // Parse columns and rows from file
        try {
          const parsed = await parseDataFile(item.filePath, item.originalFileName, 50);
          item.columns = parsed.columns;
          item.sampleRows = parsed.sampleRows;
          item.totalRows = parsed.totalRows;
        } catch (parseErr) {
          console.warn(`Could not parse ${item.originalFileName} during seeding:`, parseErr.message);
        }

        const dataset = await Dataset.create(item);
        console.log(`[Seed] Seeded dataset: "${dataset.title}" (${dataset.fileFormat})`);
      } else {
        console.log(`[Seed] Dataset already exists: "${item.title}"`);
      }
    }

    // 5. Initial Seed Activity Log
    const logExists = await ActivityLog.findOne({ action: 'BULK_IMPORT' });
    if (!logExists) {
      await ActivityLog.create({
        action: 'BULK_IMPORT',
        adminEmail: defaultEmail,
        details: 'Initial demonstration dataset repository seeded with 8 verified municipal sample datasets.',
        ipAddress: '127.0.0.1',
      });
      console.log('[Seed] Seeded initial activity log.');
    }

    console.log('[Seed] Seeding completed successfully!');
    return true;
  } catch (error) {
    console.error('[Seed] Database seeding failed:', error);
    throw error;
  }
};

// Allow direct CLI invocation `node src/utils/seed.js`
if (require.main === module) {
  seedDatabase()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
