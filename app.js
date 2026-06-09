document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const tabSavings = document.getElementById('tab-savings');
  const tabSubscription = document.getElementById('tab-subscription');
  const inputsTitle = document.getElementById('inputs-title');
  
  const selectClass = document.getElementById('select-class');
  const inputBill = document.getElementById('input-bill');
  const inputDaytime = document.getElementById('input-daytime');
  const inputSystemSize = document.getElementById('input-system-size');
  const togglePop = document.getElementById('toggle-pop');
  const toggleNetmetering = document.getElementById('toggle-netmetering');
  const toggleBattery = document.getElementById('toggle-battery');

  const seasonDry = document.getElementById('season-dry');
  const seasonWet = document.getElementById('season-wet');
  const btnPrintReport = document.getElementById('btn-print-report');
  
  const billVal = document.getElementById('bill-val');
  const daytimeVal = document.getElementById('daytime-val');
  const systemSizeVal = document.getElementById('system-size-val');
  
  const savingsValue = document.getElementById('savings-value');
  const savingsSubtitle = document.getElementById('savings-subtitle');
  const valSolarGen = document.getElementById('val-solar-gen');
  const valAnnualSavings = document.getElementById('val-annual-savings');
  const valPreRate = document.getElementById('val-pre-rate');
  const valSpectrumRate = document.getElementById('val-spectrum-rate');
  
  const barPreSolar = document.getElementById('bar-pre-solar');
  const segmentMeralco = document.getElementById('segment-meralco');
  const segmentMspectrum = document.getElementById('segment-mspectrum');
  const lblPreSolar = document.getElementById('lbl-pre-solar');
  const lblPostSolar = document.getElementById('lbl-post-solar');
  
  const legendSpectrumColor = document.getElementById('legend-spectrum-color');
  const legendSpectrumText = document.getElementById('legend-spectrum-text');
  const legendSpectrumItem = document.getElementById('legend-spectrum-item');
  
  const viewMechanicsBtn = document.getElementById('view-mechanics-btn');
  const mechanicsModal = document.getElementById('mechanics-modal');
  const closeModal = document.getElementById('close-modal');
  const selectInterestProgram = document.getElementById('select-interest-program');

  const billKwhVal = document.getElementById('bill-kwh-val');
  const statementTbody = document.getElementById('statement-tbody');

  const valCo2 = document.getElementById('val-co2');
  const valTrees = document.getElementById('val-trees');
  const valPayback = document.getElementById('val-payback');

  // Theme Interaction Elements
  const themeToggle = document.getElementById('theme-toggle');

  // State Variables
  let activePlan = 'savings'; 
  let activeSeason = 'dry'; // 'dry' or 'wet'

  // May 2026 Meralco Rate Schedule Constants (from PDF)
  const RATE_GEN = 8.7942;
  const RATE_TRANS = 1.4074;
  const RATE_SL = 0.7994;
  
  // Tiered distribution rates (Residential)
  const RES_DIST_TIERS = [
    { max: 200, rate: 0.9803 },
    { max: 300, rate: 1.2908 },
    { max: 400, rate: 1.5837 },
    { max: Infinity, rate: 2.0941 }
  ];

  // GS-A distribution rate
  const GSA_DIST_RATE = 0.7313;

  const RATE_SUPPLY_KWH = 0.4979;
  const RATE_SUPPLY_FIX = 16.38;
  const RATE_METER_KWH = 0.3350;
  const RATE_METER_FIX = 5.00;

  const RATE_AWAT = -0.4278;
  const RATE_RR = -0.0023;
  const RATE_LIFE = 0.0100;
  const RATE_SCS = 0.0001;
  const RATE_RPT = 0.0062;

  // Universal Charges
  const RATE_UC_SPUG = 0.2662;
  const RATE_UC_RED = 0.0101;
  const RATE_UC_EC = 0.0025;
  const RATE_UC_SD = 0.0428;
  const RATE_FIT = 0.2011;
  const RATE_GEA = 0.0000;

  // Taxes
  const RATE_LFT = 0.006270; // 0.6270%
  const VAT_GEN = 0.1105;
  const VAT_TRANS = 0.1100;
  const VAT_SL = 0.1104;
  const VAT_OTHER = 0.1200;

  // POP Rates (Shift based on season)
  const POP_PEAK_SHIFT_DRY = 1.79;
  const POP_PEAK_SHIFT_WET = 1.59;
  const POP_OFF_PEAK_SHIFT = -2.14;

  // Subscription fixed fee config based on system size
  const SUBSCRIPTION_FEES = {
    3: 3599, 4: 4799, 5: 5999, 6: 7199, 7: 8399, 8: 9599, 9: 10799, 10: 11999,
    11: 13199, 12: 14399, 13: 15599, 14: 16799, 15: 17999
  };

  // Theme Switcher setup
  themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('theme-midnight');
  });

  // Calculator Event Listeners
  tabSavings.addEventListener('click', () => switchTab('savings'));
  tabSubscription.addEventListener('click', () => switchTab('subscription'));
  
  selectClass.addEventListener('change', updateCalculator);
  inputBill.addEventListener('input', updateCalculator);
  inputDaytime.addEventListener('input', updateCalculator);
  inputSystemSize.addEventListener('input', updateCalculator);
  togglePop.addEventListener('change', updateCalculator);
  toggleNetmetering.addEventListener('change', updateCalculator);
  toggleBattery.addEventListener('change', updateCalculator);

  seasonDry.addEventListener('click', () => switchSeason('dry'));
  seasonWet.addEventListener('click', () => switchSeason('wet'));
  btnPrintReport.addEventListener('click', () => window.print());

  viewMechanicsBtn.addEventListener('click', () => mechanicsModal.classList.add('open'));
  closeModal.addEventListener('click', () => mechanicsModal.classList.remove('open'));
  mechanicsModal.addEventListener('click', (e) => {
    if (e.target === mechanicsModal) mechanicsModal.classList.remove('open');
  });

  function switchSeason(season) {
    activeSeason = season;
    if (season === 'dry') {
      seasonDry.classList.add('active');
      seasonWet.classList.remove('active');
    } else {
      seasonDry.classList.remove('active');
      seasonWet.classList.add('active');
    }
    updateCalculator();
  }

  function switchTab(plan) {
    activePlan = plan;
    if (plan === 'savings') {
      tabSavings.classList.add('active');
      tabSubscription.classList.remove('active');
      tabSavings.setAttribute('aria-selected', 'true');
      tabSubscription.setAttribute('aria-selected', 'false');
      
      savingsValue.className = 'savings-value display-val savings-theme';
      valAnnualSavings.className = 'cell-value text-accent';
      
      inputsTitle.textContent = "Configure Savings";
      legendSpectrumColor.className = 'legend-dot spectrum-green';
      legendSpectrumText.textContent = 'MSpectrum Bill';
      legendSpectrumItem.style.display = 'flex';
      
      if (selectInterestProgram) selectInterestProgram.value = 'savings';
    } else {
      tabSavings.classList.remove('active');
      tabSubscription.classList.add('active');
      tabSavings.setAttribute('aria-selected', 'false');
      tabSubscription.setAttribute('aria-selected', 'true');
      
      savingsValue.className = 'savings-value display-val subscription-theme';
      valAnnualSavings.className = 'cell-value text-orange-accent'; // will use normal custom style
      
      inputsTitle.textContent = "Configure Subscription";
      legendSpectrumColor.className = 'legend-dot spectrum-orange';
      legendSpectrumText.textContent = 'Fixed Monthly Fee';
      legendSpectrumItem.style.display = 'flex';
      
      if (selectInterestProgram) selectInterestProgram.value = 'subscription';
    }
    updateCalculator();
  }

  // Calculate detailed Meralco statement details
  function getMeralcoStatement(kwh, popEnabled, exportKwh, netMeteringEnabled, custClass) {
    if (kwh <= 0) kwh = 0;
    
    // Generation
    let genRate = RATE_GEN;
    if (popEnabled) {
      const peakShift = activeSeason === 'dry' ? POP_PEAK_SHIFT_DRY : POP_PEAK_SHIFT_WET;
      const peakRate = RATE_GEN + peakShift;
      const offPeakRate = RATE_GEN + POP_OFF_PEAK_SHIFT;
      genRate = (0.30 * peakRate) + (0.70 * offPeakRate);
    }
    const genAmt = kwh * genRate;

    // Transmission
    const transAmt = kwh * RATE_TRANS;

    // System Loss
    const slAmt = kwh * RATE_SL;

    // Distribution
    let distAmt = 0;
    if (custClass === 'residential') {
      RES_DIST_TIERS.forEach((tier, i) => {
        const prevMax = i === 0 ? 0 : RES_DIST_TIERS[i-1].max;
        const tierKwh = Math.max(0, Math.min(kwh, tier.max) - prevMax);
        distAmt += tierKwh * tier.rate;
      });
    } else {
      // General Service A Distribution Flat Rate
      distAmt = kwh * GSA_DIST_RATE;
    }

    const supplyAmt = (kwh * RATE_SUPPLY_KWH) + RATE_SUPPLY_FIX;
    const meterAmt = (kwh * RATE_METER_KWH) + RATE_METER_FIX;
    const distTotal = distAmt + supplyAmt + meterAmt;

    // Adjustments & Subsidies
    const awatAmt = kwh * RATE_AWAT;
    const rrAmt = kwh * RATE_RR;
    const lifeAmt = kwh * RATE_LIFE;
    const scsAmt = kwh * RATE_SCS;
    const rptAmt = kwh * RATE_RPT;
    const adjTotal = awatAmt + rrAmt + lifeAmt + scsAmt + rptAmt;

    // Universal Charges
    const ucSpug = kwh * RATE_UC_SPUG;
    const ucRed = kwh * RATE_UC_RED;
    const ucEc = kwh * RATE_UC_EC;
    const ucSd = kwh * RATE_UC_SD;
    const fitAmt = kwh * RATE_FIT;
    const geaAmt = kwh * RATE_GEA;
    const ucTotal = ucSpug + ucRed + ucEc + ucSd + fitAmt + geaAmt;

    // Taxes
    let eTax = 0;
    if (kwh > 650 && custClass === 'residential') {
      if (kwh <= 1000) {
        eTax = (kwh - 650) * 0.20;
      } else {
        eTax = (350 * 0.20) + (kwh - 1000) * 0.35;
      }
    }

    const taxableBase = genAmt + transAmt + slAmt + distTotal + adjTotal;
    const lftAmt = taxableBase * RATE_LFT;

    const vatGenAmt = genAmt * VAT_GEN;
    const vatTransAmt = transAmt * VAT_TRANS;
    const vatSlAmt = slAmt * VAT_SL;
    const vatOtherAmt = (distTotal + adjTotal) * VAT_OTHER;
    const vatTotal = vatGenAmt + vatTransAmt + vatSlAmt + vatOtherAmt;

    const grossTotal = taxableBase + ucTotal + eTax + lftAmt + vatTotal;

    // Net-Metering Credit
    let nmCredit = 0;
    if (netMeteringEnabled && exportKwh > 0) {
      nmCredit = exportKwh * RATE_GEN; 
    }

    const netTotal = Math.max(200, grossTotal - nmCredit); 

    return {
      kwh,
      genRate,
      genAmt,
      transAmt,
      slAmt,
      distAmt,
      supplyAmt,
      meterAmt,
      distTotal,
      awatAmt,
      rrAmt,
      lifeAmt,
      scsAmt,
      rptAmt,
      adjTotal,
      ucSpug,
      ucRed,
      ucEc,
      ucSd,
      fitAmt,
      geaAmt,
      ucTotal,
      eTax,
      lftAmt,
      vatTotal,
      grossTotal,
      nmCredit,
      netTotal
    };
  }

  // Solver for pre-solar reference matching class
  function solveKwhForBill(targetBill, custClass) {
    let low = 0;
    let high = 15000;
    let iterations = 24;
    let mid = 0;

    for (let i = 0; i < iterations; i++) {
      mid = (low + high) / 2;
      const state = getMeralcoStatement(mid, false, 0, false, custClass);
      if (state.netTotal < targetBill) {
        low = mid;
      } else {
        high = mid;
      }
    }
    return mid;
  }

  function formatPrice(val, decimals = 4) {
    return `₱${val.toFixed(decimals)}`;
  }

  function formatAmount(val) {
    return `₱${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function updateCalculator() {
    const custClass = selectClass.value;
    const preSolarBill = parseFloat(inputBill.value);
    let daytimePercent = parseFloat(inputDaytime.value) / 100;
    const systemSize = parseFloat(inputSystemSize.value);
    const popEnabled = togglePop.checked;
    const netMeteringEnabled = toggleNetmetering.checked;
    const batteryEnabled = toggleBattery.checked;

    billVal.textContent = `₱${preSolarBill.toLocaleString('en-US', {maximumFractionDigits:0})}`;
    daytimeVal.textContent = `${inputDaytime.value}%`;
    systemSizeVal.textContent = `${systemSize} kWp`;

    // Solve for initial consumption in kWh
    const estimatedConsumptionKwh = solveKwhForBill(preSolarBill, custClass);
    billKwhVal.textContent = `${estimatedConsumptionKwh.toLocaleString('en-US', {maximumFractionDigits:0})} kWh`;

    // Solar capacity factor based on dry vs wet season
    const capacityFactor = activeSeason === 'dry' ? 0.20 : 0.15; // Dry season is sunnier
    const solarGenerationKwh = systemSize * 24 * 30 * capacityFactor;
    valSolarGen.textContent = `${solarGenerationKwh.toLocaleString('en-US', {maximumFractionDigits:0})} kWh`;

    // Feature 5: Battery storage adds to self-consumption
    if (batteryEnabled) {
      daytimePercent = Math.min(0.95, daytimePercent + 0.30); // Store excess energy, cap self-consumption at 95%
    }

    // Daytime consumption vs solar output
    const potentialDaytimeUsage = estimatedConsumptionKwh * daytimePercent;
    const selfConsumedSolar = Math.min(solarGenerationKwh, potentialDaytimeUsage);
    const exportedSolar = netMeteringEnabled ? Math.max(0, solarGenerationKwh - selfConsumedSolar) : 0;

    const remainingGridImport = Math.max(0, estimatedConsumptionKwh - selfConsumedSolar);

    // Compute detailed statements
    const preStatement = getMeralcoStatement(estimatedConsumptionKwh, false, 0, false, custClass);
    const postStatement = getMeralcoStatement(remainingGridImport, popEnabled, exportedSolar, netMeteringEnabled, custClass);

    // MSpectrum Costs
    let mspectrumCost = 0;
    let savings = 0;

    if (activePlan === 'savings') {
      const mspectrumRateY1to3 = Math.max(11.50, RATE_GEN - 3.00);
      mspectrumCost = solarGenerationKwh * mspectrumRateY1to3;
      savings = preSolarBill - (postStatement.netTotal + mspectrumCost);
      valSpectrumRate.textContent = `₱${mspectrumRateY1to3.toFixed(2)} / kWh`;
      savingsSubtitle.innerHTML = `Under the <strong>Solar Savings Plan</strong> (Promo Year 1-3 Rate)`;
    } else {
      let baseSubscriptionFee = SUBSCRIPTION_FEES[systemSize] || (systemSize * 1200);
      if (batteryEnabled) {
        baseSubscriptionFee += 1500; // Battery rental add-on cost
      }
      mspectrumCost = baseSubscriptionFee;
      savings = preSolarBill - (postStatement.netTotal + mspectrumCost);
      valSpectrumRate.textContent = `₱${(mspectrumCost / solarGenerationKwh).toFixed(2)} / kWh eq.`;
      savingsSubtitle.innerHTML = `Under the <strong>Solar Subscription Plan</strong>`;
    }

    if (savings < 0) savings = 0;

    savingsValue.textContent = `₱${savings.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
    valAnnualSavings.textContent = `₱${(savings * 12).toLocaleString('en-US', {maximumFractionDigits: 0})}`;
    valPreRate.textContent = `₱${(preStatement.netTotal / estimatedConsumptionKwh).toFixed(2)} / kWh`;

    // Environmental Impact Math
    const co2SavedValue = (solarGenerationKwh * 12 * 0.712) / 1000;
    valCo2.textContent = `${co2SavedValue.toFixed(1)} MT`;
    valTrees.textContent = `${Math.round(co2SavedValue * 16.5)} trees`;

    // ROI simple payback (Years)
    let systemCost = systemSize * 32000; // Estimate ₱32k per kWp standard cash price equivalent
    if (batteryEnabled) systemCost += 45000; // add battery storage upfront hardware cost
    const paybackYears = savings > 0 ? (systemCost / (savings * 12)) : 0;
    valPayback.textContent = paybackYears > 0 ? `${paybackYears.toFixed(1)} Years` : 'Zero Savings';

    // Update charts
    const maxHeightPx = 140; // max design height matching CSS container
    const maxVal = Math.max(preSolarBill, postStatement.netTotal + mspectrumCost);
    
    const preSolarHeight = (preSolarBill / maxVal) * maxHeightPx;
    barPreSolar.style.height = `${preSolarHeight}px`;
    lblPreSolar.textContent = `₱${preSolarBill.toLocaleString('en-US', {maximumFractionDigits: 0})}`;

    const newMeralcoVal = postStatement.netTotal;
    const totalNewVal = newMeralcoVal + mspectrumCost;
    lblPostSolar.textContent = `₱${totalNewVal.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
    
    const meralcoSegmentHeight = (newMeralcoVal / totalNewVal) * ((totalNewVal / maxVal) * maxHeightPx);
    const mspectrumSegmentHeight = (mspectrumCost / totalNewVal) * ((totalNewVal / maxVal) * maxHeightPx);

    segmentMeralco.style.height = `${meralcoSegmentHeight}px`;
    segmentMspectrum.style.height = `${mspectrumSegmentHeight}px`;

    // Apply color class to chart stack
    if (activePlan === 'savings') {
      segmentMspectrum.className = 'bar-segment mspectrum-part';
    } else {
      segmentMspectrum.className = 'bar-segment mspectrum-part subscription-part';
    }

    // Render Detailed Table Rows
    statementTbody.innerHTML = `
      <tr class="header-row"><td colspan="4">Generation & Transmission Charges</td></tr>
      <tr><td>Generation Charge</td><td>${formatPrice(postStatement.genRate)}</td><td>${formatAmount(preStatement.genAmt)}</td><td>${formatAmount(postStatement.genAmt)}</td></tr>
      <tr><td>Transmission Charge</td><td>${formatPrice(RATE_TRANS)}</td><td>${formatAmount(preStatement.transAmt)}</td><td>${formatAmount(postStatement.transAmt)}</td></tr>
      <tr><td>System Loss Charge</td><td>${formatPrice(RATE_SL)}</td><td>${formatAmount(preStatement.slAmt)}</td><td>${formatAmount(postStatement.slAmt)}</td></tr>
      
      <tr class="header-row"><td colspan="4">Distribution Charges (Meralco)</td></tr>
      <tr><td>Distribution Charge (${custClass === 'residential' ? 'Tiered' : 'GS-A'})</td><td>${custClass === 'residential' ? 'Tiered' : formatPrice(GSA_DIST_RATE)}</td><td>${formatAmount(preStatement.distAmt)}</td><td>${formatAmount(postStatement.distAmt)}</td></tr>
      <tr><td>Supply Charge (Kwh & Fixed)</td><td>Mixed</td><td>${formatAmount(preStatement.supplyAmt)}</td><td>${formatAmount(postStatement.supplyAmt)}</td></tr>
      <tr><td>Metering Charge (Kwh & Fixed)</td><td>Mixed</td><td>${formatAmount(preStatement.meterAmt)}</td><td>${formatAmount(postStatement.meterAmt)}</td></tr>

      <tr class="header-row"><td colspan="4">Adjustments & Subsidies</td></tr>
      <tr><td>AWAT (Refund/Collect)</td><td>${formatPrice(RATE_AWAT)}</td><td>${formatAmount(preStatement.awatAmt)}</td><td>${formatAmount(postStatement.awatAmt)}</td></tr>
      <tr><td>Regulatory Reset Fee Adj</td><td>${formatPrice(RATE_RR)}</td><td>${formatAmount(preStatement.rrAmt)}</td><td>${formatAmount(postStatement.rrAmt)}</td></tr>
      <tr><td>Lifeline Subsidy</td><td>${formatPrice(RATE_LIFE)}</td><td>${formatAmount(preStatement.lifeAmt)}</td><td>${formatAmount(postStatement.lifeAmt)}</td></tr>
      <tr><td>Senior Citizen Subsidy</td><td>${formatPrice(RATE_SCS)}</td><td>${formatAmount(preStatement.scsAmt)}</td><td>${formatAmount(postStatement.scsAmt)}</td></tr>
      <tr><td>Current RPT Charge</td><td>${formatPrice(RATE_RPT)}</td><td>${formatAmount(preStatement.rptAmt)}</td><td>${formatAmount(postStatement.rptAmt)}</td></tr>

      <tr class="header-row"><td colspan="4">Universal Charges</td></tr>
      <tr><td>Missionary Electrification (SPUG)</td><td>${formatPrice(RATE_UC_SPUG)}</td><td>${formatAmount(estimatedConsumptionKwh * RATE_UC_SPUG)}</td><td>${formatAmount(remainingGridImport * RATE_UC_SPUG)}</td></tr>
      <tr><td>Missionary Electrification (RED-CI)</td><td>${formatPrice(RATE_UC_RED)}</td><td>${formatAmount(estimatedConsumptionKwh * RATE_UC_RED)}</td><td>${formatAmount(remainingGridImport * RATE_UC_RED)}</td></tr>
      <tr><td>Environmental Charge</td><td>${formatPrice(RATE_UC_EC)}</td><td>${formatAmount(estimatedConsumptionKwh * RATE_UC_EC)}</td><td>${formatAmount(remainingGridImport * RATE_UC_EC)}</td></tr>
      <tr><td>Stranded Debts Charge</td><td>${formatPrice(RATE_UC_SD)}</td><td>${formatAmount(estimatedConsumptionKwh * RATE_UC_SD)}</td><td>${formatAmount(remainingGridImport * RATE_UC_SD)}</td></tr>
      <tr><td>FiT-All Charge (Renewable)</td><td>${formatPrice(RATE_FIT)}</td><td>${formatAmount(estimatedConsumptionKwh * RATE_FIT)}</td><td>${formatAmount(remainingGridImport * RATE_FIT)}</td></tr>

      <tr class="header-row"><td colspan="4">Taxes & Offsets</td></tr>
      <tr><td>Energy Tax</td><td>Tiered</td><td>${formatAmount(preStatement.eTax)}</td><td>${formatAmount(postStatement.eTax)}</td></tr>
      <tr><td>Local Franchise Tax (LFT)</td><td>${(RATE_LFT*100).toFixed(4)}%</td><td>${formatAmount(preStatement.lftAmt)}</td><td>${formatAmount(postStatement.lftAmt)}</td></tr>
      <tr><td>Value Added Tax (VAT)</td><td>Mixed</td><td>${formatAmount(preStatement.vatTotal)}</td><td>${formatAmount(postStatement.vatTotal)}</td></tr>
      
      <tr class="net-metering-row">
        <td>Solar Net-Metering Export Credit</td>
        <td>-${formatPrice(RATE_GEN)}</td>
        <td>${formatAmount(0)}</td>
        <td>-${formatAmount(postStatement.nmCredit)}</td>
      </tr>

      <tr class="total-row">
        <td>Total Net Meralco Due</td>
        <td>--</td>
        <td>${formatAmount(preStatement.netTotal)}</td>
        <td>${formatAmount(postStatement.netTotal)}</td>
      </tr>
    `;
  }

  // Accordion Toggle for Detailed Statement
  const accordionToggleBtn = document.getElementById('accordion-toggle-btn');
  const accordionContent = document.getElementById('accordion-content');
  const accordionArrow = document.getElementById('accordion-arrow');

  accordionToggleBtn.addEventListener('click', () => {
    const isClosed = !accordionContent.style.maxHeight || accordionContent.style.maxHeight === '0px';
    if (isClosed) {
      accordionContent.style.maxHeight = accordionContent.scrollHeight + 'px';
      accordionArrow.style.transform = 'rotate(180deg)';
    } else {
      accordionContent.style.maxHeight = '0px';
      accordionArrow.style.transform = 'rotate(0deg)';
    }
  });

  // Initial Calculation
  updateCalculator();
});
