import { get, post } from 'origin-ipfs'
import uniqBy from 'lodash/uniqBy'

export default function eventCache(contract, fromBlock = 0, web3, config) {
  const queue = []
  let events = [],
    toBlock = 0,
    lastLookup = 0,
    processing = false,
    triedIpfs = false

  function updateBlock(block) {
    console.log('Update block', block)
    toBlock = block
  }

  if (!contract.options.address) {
    return { updateBlock }
  }

  const cacheStr = `eventCache${contract.options.address.slice(2, 8)}`

  try {
    if (window.localStorage[cacheStr]) {
      ({ events, lastLookup } = JSON.parse(window.localStorage[cacheStr]))
      fromBlock = lastLookup
      triedIpfs = true
    }
  } catch (e) {
    /* Ignore */
  }

  const isDone = () => new Promise(resolve => queue.push(resolve))

  async function getPastEvents() {
    if (processing) {
      await isDone()
    }
    processing = true
    if (!triedIpfs && config.ipfsEventCache) {
      console.log('Try IPFS cache...')
      let ipfsData
      try {
        ipfsData = await get(config.ipfsGateway, config.ipfsEventCache)
      } catch (e) {
        /* Ignore */
      }
      if (ipfsData && ipfsData.events) {
        console.log('Got IPFS cache')
        // console.log(ipfsData)
        events = ipfsData.events
        lastLookup = ipfsData.lastLookup
        fromBlock = ipfsData.lastLookup
        // ({ events, lastLookup } = ipfsData)
      } else {
        console.log('Error getting IPFS cache')
      }
      triedIpfs = true
    }
    if (!toBlock) {
      toBlock = await web3.eth.getBlockNumber()
    }
    if (lastLookup && lastLookup === toBlock) {
      processing = false
      return
    }
    if (lastLookup === fromBlock) {
      fromBlock += 1
    }
    console.log(
      `Fetching events from ${fromBlock} to ${toBlock}, last lookup ${lastLookup}`
    )
    lastLookup = toBlock

    const newEvents = await contract.getPastEvents('allEvents', {
      fromBlock,
      toBlock
    })

    events = uniqBy(
      [
        ...events,
        ...newEvents.map(e => ({ ...e, block: { id: e.blockNumber } }))
      ],
      e => e.id
    )

    console.log(`Found ${events.length} events, ${newEvents.length} new`)

    fromBlock = toBlock + 1
    processing = false
    while (queue.length) {
      queue.pop()()
    }

    if (typeof window !== 'undefined') {
      window.localStorage[cacheStr] = JSON.stringify({
        lastLookup,
        events
      })

      // const hash = await post(config.ipfsRPC, { events, lastLookup }, true)
      // console.log('IPFS Hash', hash)
    }
  }

  async function allEvents(eventName, party) {
    await getPastEvents()
    return events.filter(e => {
      const topics = e.raw.topics
      let matches = true
      if (eventName && e.event !== eventName) matches = false
      if (party) {
        if (
          topics[1].toLowerCase() !==
          web3.utils.padLeft(party, 64).toLowerCase()
        )
          matches = false
      }
      return matches
    })
  }

  async function listings(listingId, eventName, blockNumber) {
    await getPastEvents()
    const listingTopic = web3.utils.padLeft(
      web3.utils.numberToHex(listingId),
      64
    )
    return events.filter(e => {
      const topics = e.raw.topics
      let matches = topics[2] === listingTopic
      if (eventName && e.event !== eventName) matches = false
      if (blockNumber && e.blockNumber > blockNumber) matches = false
      return matches
    })
  }

  async function offers(listingIds, offerId, eventName) {
    await getPastEvents()
    if (!Array.isArray(listingIds)) {
      listingIds = [listingIds]
    }
    const listingTopics = listingIds.map(listingId =>
      web3.utils.padLeft(web3.utils.numberToHex(listingId), 64)
    )
    const offerTopic = typeof offerId === 'number'
      ? web3.utils.padLeft(web3.utils.numberToHex(offerId), 64)
      : null

    return events.filter(e => {
      const topics = e.raw.topics
      const matchesListing = listingTopics.indexOf(topics[2]) >= 0,
        matchesOffer = offerTopic ? topics[3] === offerTopic : true,
        matchesEvent = eventName ? e.event === eventName : true
      return matchesListing && matchesOffer && matchesEvent
    })
  }

  return { listings, offers, allEvents, updateBlock }
}
