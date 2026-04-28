import mongoose from "mongoose";
import dns from "node:dns/promises";
import { URL } from "node:url";

const dbConnect = async () => {
  const mongoUri = process.env.MONGO_DIRECT_URI || process.env.MONGO_URI
  const fallbackUri = process.env.MONGO_FALLBACK_URI || "mongodb://127.0.0.1:27017/smart-classroom"

  if (!mongoUri) {
    console.error("Database connection warning: MONGO_URI is not set. The server will start without MongoDB.")
    return false
  }

  const connect = async (uri, label) => {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    })
    console.log(`Database connected (${label})`)
    return true
  }

  const expandSrvUri = async (uri) => {
    if (!uri.startsWith("mongodb+srv://")) {
      return uri
    }

    const parsed = new URL(uri)
    const lookupHost = parsed.hostname
    const srvRecords = await dns.resolveSrv(`_mongodb._tcp.${lookupHost}`)

    if (!srvRecords.length) {
      throw new Error("No SRV records were returned for the MongoDB cluster.")
    }

    const txtRecords = await dns.resolveTxt(lookupHost).catch(() => [])

    const txtQuery = txtRecords.flat().join("&")
    const params = new URLSearchParams(parsed.search)

    if (txtQuery) {
      const atlasParams = new URLSearchParams(txtQuery)
      for (const [key, value] of atlasParams.entries()) {
        if (!params.has(key)) {
          params.set(key, value)
        }
      }
    }

    if (!params.has("retryWrites")) {
      params.set("retryWrites", "true")
    }
    if (!params.has("w")) {
      params.set("w", "majority")
    }
    if (!params.has("tls") && !params.has("ssl")) {
      params.set("tls", "true")
    }

    const credentials =
      parsed.username || parsed.password
        ? `${encodeURIComponent(parsed.username)}:${encodeURIComponent(parsed.password)}@`
        : ""

    const hosts = srvRecords
      .map((record) => `${record.name}:${record.port}`)
      .join(",")

    return `mongodb://${credentials}${hosts}${parsed.pathname || "/"}?${params.toString()}`
  }

  try {
    const normalizedUri = await expandSrvUri(process.env.MONGO_DIRECT_URI || mongoUri)
    return await connect(normalizedUri, normalizedUri === mongoUri ? "primary" : "primary-explicit")
  } catch (error) {
    console.error("Primary database connection failed:", error.message)

    const shouldTryFallback =
      process.env.MONGO_FALLBACK_URI ||
      (!mongoUri.includes("127.0.0.1") && !mongoUri.includes("localhost"))

    if (shouldTryFallback) {
      try {
        console.warn("Trying local MongoDB fallback...")
        return await connect(fallbackUri, "fallback")
      } catch (fallbackError) {
        console.error("Fallback database connection failed:", fallbackError.message)
      }
    }

    console.warn("Starting backend without a live MongoDB connection. API routes will return database errors until the URI is fixed.")
    return false
  }
};

export default dbConnect;
