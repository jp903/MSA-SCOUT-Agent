#!/usr/bin/env node

require("dotenv").config({ path: ".env.local" })

const rapidApiKey = process.env.RAPIDAPI_KEY

if (!rapidApiKey) {
  console.log("❌ RAPIDAPI_KEY not found in environment variables")
  console.log("📝 Please add RAPIDAPI_KEY to your .env.local file")
  process.exit(1)
}

console.log("🔑 RapidAPI Key Check")
console.log(`Key: ${rapidApiKey.substring(0, 8)}...${rapidApiKey.substring(rapidApiKey.length - 4)}`)
console.log(`Length: ${rapidApiKey.length} characters`)

console.log("\n🧪 Testing RapidAPI subscriptions...\n")

const testEndpoints = [
  {
    name: "Zillow API #1",
    url: "https://zillow-com1.p.rapidapi.com/search",
    host: "zillow-com1.p.rapidapi.com",
    params: "?location=New+York",
  },
  {
    name: "Zillow API #2",
    url: "https://zillow56.p.rapidapi.com/search",
    host: "zillow56.p.rapidapi.com",
    params: "?location=New+York",
  },
  {
    name: "LoopNet API #1",
    url: "https://loopnet2.p.rapidapi.com/properties/search",
    host: "loopnet2.p.rapidapi.com",
    params: "?location=New+York",
  },
  {
    name: "LoopNet API #2",
    url: "https://loopnet-com.p.rapidapi.com/search",
    host: "loopnet-com.p.rapidapi.com",
    params: "?location=New+York",
  },
]

async function testEndpoint(endpoint) {
  try {
    console.log(`🔍 Testing ${endpoint.name}...`)

    const response = await fetch(endpoint.url + endpoint.params, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": rapidApiKey,
        "X-RapidAPI-Host": endpoint.host,
        Accept: "application/json",
      },
    })

    console.log(`   Status: ${response.status}`)

    if (response.status === 403) {
      console.log(`   ❌ Not subscribed to ${endpoint.name}`)
      console.log(`   💡 Go to RapidAPI and subscribe to this API`)
      return { name: endpoint.name, status: "not_subscribed" }
    } else if (response.status === 401) {
      console.log(`   ❌ Invalid API key`)
      return { name: endpoint.name, status: "invalid_key" }
    } else if (response.ok) {
      try {
        const data = await response.json()
        console.log(`   ✅ ${endpoint.name} is working!`)
        console.log(`   📊 Response has keys: ${Object.keys(data).slice(0, 5).join(", ")}`)
        return { name: endpoint.name, status: "working", data: Object.keys(data) }
      } catch (parseError) {
        console.log(`   ⚠️  Got response but couldn't parse JSON`)
        return { name: endpoint.name, status: "parse_error" }
      }
    } else {
      console.log(`   ⚠️  Unexpected status: ${response.status}`)
      const text = await response.text()
      console.log(`   Response: ${text.substring(0, 100)}...`)
      return { name: endpoint.name, status: "error", code: response.status }
    }
  } catch (error) {
    console.log(`   ❌ Network error: ${error.message}`)
    return { name: endpoint.name, status: "network_error", error: error.message }
  }
}

async function runAllTests() {
  const results = []

  for (const endpoint of testEndpoints) {
    const result = await testEndpoint(endpoint)
    results.push(result)
    console.log() // Empty line for readability
  }

  console.log("=".repeat(60))
  console.log("📊 SUMMARY")
  console.log("=".repeat(60))

  const working = results.filter((r) => r.status === "working")
  const notSubscribed = results.filter((r) => r.status === "not_subscribed")
  const errors = results.filter((r) => !["working", "not_subscribed"].includes(r.status))

  console.log(`✅ Working APIs: ${working.length}`)
  working.forEach((r) => console.log(`   - ${r.name}`))

  console.log(`❌ Not Subscribed: ${notSubscribed.length}`)
  notSubscribed.forEach((r) => console.log(`   - ${r.name}`))

  if (errors.length > 0) {
    console.log(`⚠️  Other Issues: ${errors.length}`)
    errors.forEach((r) => console.log(`   - ${r.name}: ${r.status}`))
  }

  console.log("\n🎯 RECOMMENDATIONS:")

  if (working.length === 0) {
    console.log("❌ No APIs are working!")
    console.log("   1. Check your RapidAPI key is correct")
    console.log("   2. Subscribe to at least one Zillow or LoopNet API")
    console.log("   3. Make sure your subscription is active")
  } else if (working.length < 2) {
    console.log("⚠️  Limited API access")
    console.log("   1. Consider subscribing to more APIs for better coverage")
    console.log("   2. You can still use the app with current subscriptions")
  } else {
    console.log("✅ Great! You have multiple working APIs")
    console.log("   1. Your property search should work well")
    console.log("   2. Start the app with: npm run dev")
  }

  if (notSubscribed.length > 0) {
    console.log("\n📝 To subscribe to missing APIs:")
    console.log("   1. Go to https://rapidapi.com/developer/dashboard")
    console.log('   2. Search for "Zillow" or "LoopNet"')
    console.log("   3. Subscribe to the APIs (many have free tiers)")
    console.log("   4. Run this test again")
  }
}

runAllTests().catch(console.error)
