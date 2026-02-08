import type { Session } from '@entities/session/model/types'

const STORAGE_VERSION = 'v1'
const LOCAL_KEY = `auth:${STORAGE_VERSION}`
const SESSION_KEY = `auth:${STORAGE_VERSION}:temp`

const storageCache = new Map<string, string | null>()
let sessionCache: Session | null | undefined = undefined
let listenersAttached = false

function ensureStorageCacheListeners() {
	if (listenersAttached || typeof window === 'undefined') {
		return
	}
	listenersAttached = true
	window.addEventListener('storage', event => {
		if (event.key) {
			storageCache.delete(`local:${event.key}`)
			storageCache.delete(`session:${event.key}`)
		} else {
			storageCache.clear()
		}
		sessionCache = undefined
	})
	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'visible') {
			storageCache.clear()
			sessionCache = undefined
		}
	})
}

function cacheKey(storage: Storage, key: string) {
	return `${storage === localStorage ? 'local' : 'session'}:${key}`
}

function getStorageValue(storage: Storage, key: string) {
	const keyWithScope = cacheKey(storage, key)
	if (!storageCache.has(keyWithScope)) {
		storageCache.set(keyWithScope, storage.getItem(key))
	}
	return storageCache.get(keyWithScope) ?? null
}

function setStorageValue(storage: Storage, key: string, value: string) {
	storage.setItem(key, value)
	storageCache.set(cacheKey(storage, key), value)
}

function removeStorageValue(storage: Storage, key: string) {
	storage.removeItem(key)
	storageCache.set(cacheKey(storage, key), null)
}

function readFromStorage(storage: Storage, key: string): Session | null {
	try {
		const raw = getStorageValue(storage, key)
		if (!raw) {
			return null
		}
		return JSON.parse(raw) as Session
	} catch {
		return null
	}
}

export function loadSession(): Session | null {
	ensureStorageCacheListeners()
	if (sessionCache !== undefined) {
		return sessionCache
	}
	const localSession = readFromStorage(localStorage, LOCAL_KEY)
	const sessionSession = readFromStorage(sessionStorage, SESSION_KEY)
	const active = localSession ?? sessionSession
	if (!active) {
		sessionCache = null
		return null
	}
	if (Date.now() > active.expiresAt) {
		clearSession()
		sessionCache = null
		return null
	}
	sessionCache = active
	return active
}

export function saveSession(session: Session) {
	ensureStorageCacheListeners()
	try {
		removeStorageValue(localStorage, LOCAL_KEY)
		removeStorageValue(sessionStorage, SESSION_KEY)
	} catch {
		// Ignore storage errors.
	}

	try {
		const target = session.remember ? localStorage : sessionStorage
		const key = session.remember ? LOCAL_KEY : SESSION_KEY
		setStorageValue(target, key, JSON.stringify(session))
	} catch {
		// Ignore storage errors.
	}
	sessionCache = session
}

export function clearSession() {
	ensureStorageCacheListeners()
	try {
		removeStorageValue(localStorage, LOCAL_KEY)
		removeStorageValue(sessionStorage, SESSION_KEY)
	} catch {
		// Ignore storage errors.
	}
	sessionCache = null
}
