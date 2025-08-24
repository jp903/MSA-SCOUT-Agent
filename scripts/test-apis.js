#!/usr/bin/env node

require("dotenv").config({ path: ".env.local" })

const rapidApiKey = process.env.RAPIDAPI_KEY
const rentcastApiKey = process.env.RENTCAST_API_KEY

console.log("🧪 Testing API connections...\n")

async function testZillow() {
  if (!rapidApiKey) {
    console.log("❌ Zillow: RAPIDAPI_KEY not configured")
    return false
  }

  const hosts = ["zillow-com1.p.rapidapi.com", "zillow56.p.rapidapi.com", "zillow-base1.p.rapidapi.com"]

  for (const host of hosts) {
    try {
      console.log(`🏠 Testing Zillow host: ${host}`)

      const response = await fetch(`https://${host}/search?location=New+York`, {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": rapidApiKey,
          "X-RapidAPI-Host": host,
          Accept: "application/json",
        },
      })

      console.log(`   Status: ${response.status}`)

      if (response.status === 403) {
        console.log(`   ❌ Not subscribed to ${host}`)
        continue
      }

      if (response.ok) {
        const data = await response.json()
        console.log(`   ✅ ${host} is working!`)
        console.log(`   📊 Response keys: ${Object.keys(data).join(", ")}`)
        return true
      } else {
        console.log(`   ⚠️  ${host} returned ${response.status}`)
      }
    } catch (error) {
      console.log(`   ❌ Error testing ${host}:`, error.message)
    }
  }

  return false
}

async function testLoopNet() {
  if (!rapidApiKey) {
    console.log("❌ LoopNet: RAPIDAPI_KEY not configured")
    return false
  }

  const hosts = ["loopnet2.p.rapidapi.com", "loopnet-com.p.rapidapi.com", "loopnet1.p.rapidapi.com"]

  for (const host of hosts) {
    try {
      console.log(`🏢 Testing LoopNet host: ${host}`)

      const response = await fetch(`https://${host}/properties/search?location=New+York`, {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": rapidApiKey,
          "X-RapidAPI-Host": host,
          Accept: "application/json",
        },
      })

      console.log(`   Status: ${response.status}`)

      if (response.status === 403) {
        console.log(`   ❌ Not subscribed to ${host}`)
        continue
      }

      if (response.ok) {
        const data = await response.json()
        console.log(`   ✅ ${host} is working!`)
        console.log(`   📊 Response keys: ${Object.keys(data).join(", ")}`)
        return true
      } else {
        console.log(`   ⚠️  ${host} returned ${response.status}`)
      }
    } catch (error) {
      console.log(`   ❌ Error testing ${host}:`, error.message)
    }
  }

  return false
}

async function testRentCast() {
  if (!rentcastApiKey) {
    console.log("⚪ RentCast: API key not configured (optional)")
    return false
  }

  try {
    console.log("🏘️ Testing RentCast...")

    const response = await fetch("https://api.rentcast.io/v1/listings/rental?city=New+York&state=NY&limit=1", {
      headers: {
        "X-Api-Key": rentcastApiKey,
        Accept: "application/json",
      },
    })

    console.log(`   Status: ${response.status}`)

    if (response.ok) {
      const data = await response.json()
      console.log("   ✅ RentCast is working!")
      console.log(`   📊 Found ${data.listings?.length || 0} listings`)
      return true
    } else {
      console.log(`   ❌ RentCast returned ${response.status}`)
      const errorText = await response.text()
      console.log(`   Error: ${errorText}`)
    }
  } catch (error) {
    console.log("   ❌ Error testing RentCast:", error.message)
  }

  return false
}

async function runTests() {
  const results = {
    zillow: await testZillow(),
    loopnet: await testLoopNet(),
    rentcast: await testRentCast(),
  }

  console.log("\n" + "=".repeat(50))
  console.log("📊 Test Results:")
  console.log(`   Zillow: ${results.zillow ? "✅ Working" : "❌ Failed"}`)
  console.log(`   LoopNet: ${results.loopnet ? "✅ Working" : "❌ Failed"}`)
  console.log(`   RentCast: ${results.rentcast ? "✅ Working" : "⚪ Not configured/Failed"}`)

  const workingApis = Object.values(results).filter(Boolean).length

  if (workingApis === 0) {
    console.log("\n❌ No APIs are working! Please check your subscriptions and keys.")
    console.log("📖 See docs/ENVIRONMENT_SETUP.md for setup instructions")
  } else if (workingApis < 2) {
    console.log("\n⚠️  Only some APIs are working. Consider subscribing to more for better results.")
  } else {
    console.log("\n✅ Multiple APIs are working! You should get good property search results.")
  }

  console.log("\n🎯 Next Steps:")
  if (!results.zillow && !results.loopnet) {
    console.log("   1. Check your RapidAPI subscriptions")
    console.log("   2. Verify your RAPIDAPI_KEY is correct")
    console.log("   3. Make sure you have active subscriptions to Zillow and/or LoopNet APIs")
  } else {
    console.log("   1. Start the development server: npm run dev")
    console.log("   2. Go to the Deal Finder page")
    console.log("   3. Try searching for properties!")
  }
}

runTests().catch(console.error)
