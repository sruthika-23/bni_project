// Seed data transcribed from the Excel tracker (Meeting Updates, Specific Connect Tracker, MOM 2).
// Column alignment in the exported PDF was lost, so some cells may sit in a neighbouring column – edit in the app.
export function seedExtras(id) {
  let k = 0, j = 0
  const A = '14-Oct-2026', B = '28-Oct-2026'
  const o = (d, m, cl = '', pr = '', pp = '', ask = '', ow = null) => ({ id: ++k, d, m: id(m), cl, pr, pp, ask, ow: ow ? id(ow) : null })
  const c = (d, m, t, ow = null, cp = '') => ({ id: ++j, d, f: id(m), t, cp, ask: '', ow: ow ? id(ow) : null, st: 'Requested', intro: '', won: 0 })
  const opps = [
    o(A, 'Abhay', 'Pioneer Vincon', '', '', 'Daikin Aircondition Ltd'),
    o(A, 'Abhay', 'Supriya Elevators', '', '', 'Hutson Agro'),
    o(A, 'Abhay', 'Johnson Lifts', '', '', 'Kone elevators'),
    o(A, 'Santhosh', 'Bray Controls', 'Exports, Blackening', '', 'Delphi TVS'),
    o(A, 'Santhosh', 'Locks', '', 'Danfoss'),
    o(A, 'Santhosh', 'Planys'),
    o(A, 'Santhosh', 'Xyna'),
    o(A, 'Krishna', 'TN Edible Oil', '', 'Sriram Foam', 'Sharadha Motors, Irungatukotai'),
    o(A, 'Krishna', 'BDJ Oxides', '', 'Welker India Pvt Ltd', 'NSK Bearing'),
    o(A, 'Krishna', 'MAK Control systems', '', 'K-tec', 'Daimler India Ltd', 'Sivaganesh'),
    o(A, 'Krishna', 'NU-tech India Pvt Ltd', '', 'Techno Fabs', 'CEAT Tyres'),
    o(A, 'Krishna', 'D- Propels'),
    o(A, 'Sakthivel', 'Nordstone Pvt Ltd', '', '', 'Titan Industries'),
    o(A, 'Sakthivel', 'PR-Fect casting Engineering, Thirumulavoyal', '', '', 'Johnson Lifts', 'Abhay'),
    o(A, 'Sakthivel', 'Utsarva Jewellery Manufacturing', '', '', 'Pricol Precision'),
    o(A, 'Sakthivel', '', '', '', 'Salzer'),
    o(A, 'Sampath', 'Fimer India Pvt Ltd, Bangalore', '', '', 'Glonix Electronics pvt ltd'),
    o(A, 'Sampath', 'Inventa', '', '', 'Ismat spares'),
    o(A, 'Sampath', 'Wearcheck India', '', '', 'Coromandel Electronics'),
    o(A, 'Sampath', 'Seko Logistics'),
    o(A, 'Sivaganesh', 'Sundaram Clayton, Oragadam', '', 'Appollo Tyres', 'Isuzu motors, Sricity'),
    o(A, 'Sivaganesh', 'Wheels India Ltd, Thervoykandigai', '', 'Titan Industries', 'Bluestar Limited'),
    o(A, 'Sivaganesh', 'Bharath Forge, Tada', '', '', 'Parryware, Ranipet'),
    o(B, 'Abhay', 'New: Ravel Hiteks - Perungudi, Woory Automobiles, Procmart. Existing: Johnson Lifts, Chennai Radha Engg, Supriya', 'Clamp Meter, Thermometer, Multimeter, Vernier caliper', 'Jindal Aluminium, Hero Motocorp', 'Hutson Agro'),
    o(B, 'Abhay', '', '', '', 'Yamaha Motors', 'Sampath'),
    o(B, 'Abhay', '', '', '', 'India Pistons', 'Sampath'),
    o(B, 'Abhay', '', '', '', 'Rishab Industries', 'Sampath'),
    o(B, 'Sampath', 'Inventa Lighting, Seko Logistics, Macro Logistics, DP World', '', '', 'Ismat Engineering; Glonix; Shell Corporate'),
    o(B, 'Sakthivel', 'Nordstone Pvt Ltd, Utsarva Jewellery Manufacturing', 'Customized mobile applications, B2C applications, POMS Apps', '', 'Pricol Precisions; Hyundai Motors; TVS Motors; Salzer'),
    o(B, 'Krishna', 'Nutech Win Parts - Gerugambakam, Vallam, Dineshkumar Engineering (HT tower mang), MAK Controls, BSS Steels', 'AMC for security surveillance', '', 'Momentiv Performance Materials India P Ltd; Super Auto Forge; BSA Corporation; Precision Bright Steel Industries'),
    o(B, 'Ramya', 'Thirumala Roofings, LCP Structural Builders, Maya Engineering, TAFE', 'Recruit for Industrial manf and EPC companies, Non-IT category', 'SV EV Bikes Coimbatore, Rapttee Bikes, Touch n Feel HVAC', 'Tapco EPC; KEPL MEP; Power Tech Substations'),
    o(B, 'Ramya', '', '', '', 'SPIC', 'Sampath'),
    o(B, 'Ramya', '', '', '', 'Touch n Feel Pvt Ltd', 'Abhay'),
    o(B, 'Sivaganesh', '', '', 'Bharath Forge Ltd, Uno Minda Ltd, SCL', 'Yamaha Motors; KH Exports; Motherson Ltd'),
  ]
  const connects = [
    c(A, 'Abhay', 'Daikin Aircondition Ltd'), c(A, 'Abhay', 'Hutson Agro'), c(A, 'Abhay', 'Kone elevators'),
    c(A, 'Santhosh', 'Delphi TVS'),
    c(A, 'Krishna', 'Sharadha Motors, Irungatukotai'), c(A, 'Krishna', 'NSK Bearing'), c(A, 'Krishna', 'Daimler India Ltd', 'Sivaganesh'), c(A, 'Krishna', 'CEAT Tyres'),
    c(A, 'Sakthivel', 'Titan Industries'), c(A, 'Sakthivel', 'Johnson Lifts', 'Abhay'), c(A, 'Sakthivel', 'Pricol Precision'), c(A, 'Sakthivel', 'Salzer'),
    c(A, 'Sampath', 'Glonix Electronics Pvt Ltd'), c(A, 'Sampath', 'Ismat Spares'), c(A, 'Sampath', 'Coromandel Electronics'),
    c(A, 'Sivaganesh', 'Isuzu Motors, Sricity'), c(A, 'Sivaganesh', 'Bluestar Limited'), c(A, 'Sivaganesh', 'Parryware, Ranipet'),
    c(B, 'Abhay', 'Hutson Agro'), c(B, 'Abhay', 'Yamaha Motors', 'Sampath', 'HR'), c(B, 'Abhay', 'India Pistons', 'Sampath'), c(B, 'Abhay', 'Rishab Industries', 'Sampath'),
    c(B, 'Sampath', 'Ismat Engineering'), c(B, 'Sampath', 'Glonix'), c(B, 'Sampath', 'Shell Corporate'),
    c(B, 'Sakthivel', 'Pricol Precisions'), c(B, 'Sakthivel', 'Hyundai Motors'), c(B, 'Sakthivel', 'TVS Motors'), c(B, 'Sakthivel', 'Salzer'),
    c(B, 'Krishna', 'Momentiv Performance Materials India P Ltd'), c(B, 'Krishna', 'Super Auto Forge'), c(B, 'Krishna', 'BSA Corporation'), c(B, 'Krishna', 'Precision Bright Steel Industries'),
    c(B, 'Ramya', 'Tapco EPC'), c(B, 'Ramya', 'KEPL MEP'), c(B, 'Ramya', 'Power Tech Substations'), c(B, 'Ramya', 'SPIC', 'Sampath'), c(B, 'Ramya', 'Touch n Feel Pvt Ltd', 'Abhay'),
    c(B, 'Sivaganesh', 'Yamaha Motors'), c(B, 'Sivaganesh', 'KH Exports'), c(B, 'Sivaganesh', 'Motherson Ltd'),
  ]
  const moms = [{
    no: 2, team: 1, d: B, t: '08:30', venue: 'EEE office', captain: '', by: 'Sivaganesh Dorairaj',
    welcome: 'Done', intro: 'Each member gave a brief intro', visitors: 'NA',
    present: '3 mins presentation by Abhay Bhansali. Explained his products, what to look out for and how to refer. Highlighted his specific connects and contact spheres: multimeters, clamp meters, thermometers, vernier calipers.',
    joint: '0', socials: '', other: '',
    ap: [
      { p: 'Follow-up update', tl: '10-Nov-2026', r: '', st: '', fu: '' },
      { p: 'Specific connect closure', tl: '10-Nov-2026', r: '', st: '', fu: '' },
      { p: 'Joint calls - 2', tl: '10-Nov-2026', r: 'Each member', st: '', fu: '' },
    ],
    nd: '11-Nov-2026', nt: '08:30', nv: 'IControl Automation Office',
  }]
  return { opps, connects, moms, acts: [] }
}
