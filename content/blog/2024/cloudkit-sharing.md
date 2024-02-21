---
title: On CloudKit Sharing
date: 2024-02-21
tags: iOS
---

There's a lot of articles of how to set up CloudKit syncing for private database.

There's some writing on how to set up [CloudKit sharing](https://developer.apple.com/documentation/cloudkit/shared_records) but they all end when things start to get interesting: how to edit those and even add new records to the share.

That is, when you aren't using Core Data but you want to use any persisting method.

## State of affairs

There's good introductions to CloudKit already so I won't go there in detail. [Rambo's CloudKit 101](https://rambo.codes/posts/2020-02-25-cloudkit-101) is one that you should check out.

Apple's [documentation](https://developer.apple.com/documentation/coredata/sharing_core_data_objects_between_icloud_users) is mostly covering how to handle sharing when using CloudKit together with Core Data. I guess Core Data is so nice that it ought to be enough for everybody.

Enter WWDC 2024 and [introduction](https://www.wwdcnotes.com/notes/wwdc23/10188/) of [CKSyncEngine](https://developer.apple.com/documentation/cloudkit/cksyncengine)! I had written my somewhat working implemntation before that but that got scrapped in favour of much cleanier solution with `CKSyncEngine`.

`CKSyncEngine` enables us to implement CloudKit syncing with any local storage without too much hassle. Sharing, on the other hand, I could find no examples of how it should be done.

## Example domain

Let's say I am building a cost splitting app. The root level model is a `Group` that has a number of `Members`s (for example the people with you on a vacation trip) and `Cost`s (hotel, food, etc that needs to be split between the people). There's a clear hierarchy there. Everything belongs to some `Group`.

## Identifying records in CloudKit

Pretty much everything is a [`CKRecord`](https://developer.apple.com/documentation/cloudkit/ckrecord) when we're talking CloudKit.

A record is identified by [`CKRecord.ID`](https://developer.apple.com/documentation/cloudkit/ckrecord/id) which then consists of the `recordName` (that is the UUID of your model) and `zoneID` which is made of `zoneName` and `ownerName`.

To sync a new _thing_ into CloudKit we need to create a new `CKRecord` instance, set our own model's properties in there and then send that to CloudKit.

When creating a new record in our own private database it might look like this:

```swift
let record = CKRecord(recordType: "Group", recordID: CKRecord.ID(recordName: group.id))
```

You don't even need to know what the heck to put in as the zoneID as there is a convenience initializer to create it in the default zone. No need to even think about what is the proper `zoneName` and `ownerName` for this record.

That won't fly when you are dealing with sharing.

## Sharing

CloudKit sharing is managed through a [`CKShare`](https://developer.apple.com/documentation/cloudkit/ckshare).

In the described cost splitting app, we are sharing a _record hierarchy_. The goal is that we share a Group with the people we are travelling with and those people can add any costs there that needs to be split between the group members.

This hierarchy is achieved with the [`parent`](https://developer.apple.com/documentation/cloudkit/ckrecord/1640527-parent) property of a CKRecord.

After you have set up [`UICloudSharingController`](https://developer.apple.com/documentation/uikit/uicloudsharingcontroller) as documented, you can get the first step working. You can see the records that are shared with you.

### The easy part

You need to initialize two instances of the `CKSyncEngine`. One for private database and another for shared. You need to also keep hold of the sync state for both of them separately.

I made a `SyncEngine` class that is initialized with the `scope`. It has something like following (see also [Apple's example of CKSyncEngine](https://github.com/apple/sample-cloudkit-sync-engine)):

```swift
let scope: CKDatabase.Scope

var serializedState: CKSyncEngine.State.Serialization? {
  get {
    if scope == .private {
      return Storage.Sync.syncStateForPrivateDb
    } else {
      return Storage.Sync.syncStateForSharedDb
    }
  }
  set {
    if scope == .private {
      Storage.Sync.syncStateForPrivateDb = newValue
    } else {
      Storage.Sync.syncStateForSharedDb = newValue
    }
  }
}

func setup(scope: CKDatabase.Scope, container: CKContainer) {
  self.scope = scope
  let configuration = CKSyncEngine.Configuration(
    database: container.database(with: scope),
    stateSerialization: serializedState,
    delegate: self
  )
  let engine = CKSyncEngine(configuration)
  // ...
}
```

Another class, a `SyncManager` (naming things, ugh...) owns both sync engines and coordinates the rest of the logic which we'll get into next.

### The funny part

As you get to this point, you may notice that the `zoneID` of the shared record is not the same for the owner and the share participant.

Everything mostly _just works_ until you want to add a new record under the share. As a member of your vacation trip you might want to add a splittable cost also yourself.

For that, we need to know which _share_ we are talking about. I am using [GRDB](https://github.com/groue/GRDB.swift) for my persistence layer and the sync engine gets notified when anything changes in the database through its [ValueObservation](https://swiftpackageindex.com/groue/grdb.swift/v6.24.2/documentation/grdb/valueobservation). Quite similar to how [Harmony](https://github.com/aaronpearce/Harmony) works.

As the sync engine gets notified that a new `Cost` has been added, it needs to

- get the `Group` that the `Cost` belongs to
- decide should this be synced to private or shared database
- decode the group's _system fields_ to get the `CKRecordZone.ID` for the specific share
- create the new `CKRecord` for the cost using the same record zone

You should use [`encodeSystemFields(with:)`](https://developer.apple.com/documentation/cloudkit/ckrecord/1462200-encodesystemfields) to store the CloudKit metadata together with you model's other properties in your database. That includes the record ID so you can retrieve the zone ID from there.

That is pretty much all I know of the topic. If I'm doing something dummy and you can actually somehow skip the "get the parent record's zone ID" part, please let me know!

---

_Written on one go, the text might be a bit heavy or otherwise wonky, I might come back and clean it up a bit later._
