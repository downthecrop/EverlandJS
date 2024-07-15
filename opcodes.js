﻿const MessageOpcode = {
    None: 0,

    EstablishSessionResponse: 1000,
    PongMessage: 1001,
    SessionClosedEvent: 1002,
    ReestablishSessionEvent: 1003,

    EstablishSessionRequest: 1100,
    PingMessage: 1101,
    CloseSessionRequest: 1102,

    CharacterSnapshotEvent: 3000,
    CharacterProfileUpdatedEvent: 3001,
    CharacterAppearanceUpdatedEvent: 3002,
    CharacterLoadoutCreatedEvent: 3003,
    CharacterLoadoutDeletedEvent: 3004,
    CharacterLoadoutRenamedEvent: 3005,
    CharacterLoadoutUpdatedEvent: 3006,

    EquipItemRequest: 3100,
    UnequipItemRequest: 3101,
    GetCharacterProfileRequest: 3102,
    UpdateProfileRequest: 3103,
    CreateLoadoutRequest: 3104,
    UpdateLoadoutRequest: 3105,
    RestoreLoadoutRequest: 3106,
    RenameLoadoutRequest: 3107,
    DeleteLoadoutRequest: 3108,

    InventorySnapshotEvent: 4000,
    ItemAddedEvent: 4001,
    ItemRemovedEvent: 4002,
    ItemUpdatedEvent: 4003,
    ItemTransferredEvent: 4004,

    JoinChannelFailedEvent: 5000,
    LeaveChannelFailedEvent: 5001,
    SubscribedToChannelEvent: 5002,
    UnsubscribedFromChannelEvent: 5003,
    ChannelSubscriptionUpdatedEvent: 5004,
    ChannelSubscriptionAddedEvent: 5005,
    ChannelSubscriptionRemovedEvent: 5006,
    ChannelMessageEvent: 5007,
    ChannelMessageSentEvent: 5008,
    ChannelMessageSendFailedEvent: 5009,
    ChannelMessageAcknowledgedEvent: 5010,
    ChannelMessageAcknowledgementFailedEvent: 5011,
    EstablishDirectChannelFailedEvent: 5012,
    GroupChannelCreatedEvent: 5013,
    CreateGroupChannelFailedEvent: 5014,
    ChannelRenamedEvent: 5015,
    RenameChannelFailedEvent: 5016,
    ChannelInvitationEvent: 5017,
    ChannelInvitationExpiredEvent: 5018,
    ChannelInvitationSentEvent: 5019,
    InviteToChannelFailedEvent: 5020,
    CommunityChannelListEvent: 5021,
    SystemMessageEvent: 5022,

    JoinChannelRequest: 5100,
    LeaveChannelRequest: 5101,
    SendMessageToChannelRequest: 5102,
    AcknowledgeChannelMessageRequest: 5103,
    GetChannelHistoryRequest: 5104,
    EstablishDirectChannelRequest: 5105,
    EstablishDirectChannelByNameRequest: 5106,
    CreateGroupChannelRequest: 5107,
    TransferGroupOwnershipRequest: 5108,
    KickChannelSubscriberRequest: 5109,
    RenameChannelRequest: 5110,
    InviteToChannelRequest: 5111,
    InviteToChannelByNameRequest: 5112,
    RevokeChannelInviteRequest: 5113,
    GetCommunityChannelsRequest: 5114,
    SearchCommunityChannelsRequest: 5115,

    ShopUpdatedEvent: 9000,
    ShopTransactionsOccurredEvent: 9001,
    GetBuybackListResponse: 9002,
    ShopSessionOpenedEvent: 9003,
    ShopSessionClosedEvent: 9004,
    BuyItemFailedEvent: 9005,
    SellItemFailedEvent: 9006,
    BuybackItemFailedEvent: 9007,
    GetBuybackListFailedEvent: 9008,
    CloseShopSessionFailedEvent: 9009,
    KeepShopSessionAliveFailedEvent: 9010,

    BuyItemRequest: 9100,
    SellItemRequest: 9101,
    BuybackItemRequest: 9102,
    GetBuybackListRequest: 9103,
    KeepShopSessionAliveRequest: 9104,
    CloseShopSessionRequest: 9105,

    GameSessionOpenedEvent: 100000,
    GameSessionClosedEvent: 100001,
    BeginBulkLoadMessage: 100002,
    EndBulkLoadMessage: 100003,
    GetChannelsResponse: 100004,
    UpdateChannelResponse: 100005,
    GameStabilityEvent: 100006,
    GetChannelsRequest: 100100,
    UpdateChannelRequest: 100101,

    EntityDespawnCommand: 101000,
    EntityJoinedEvent: 101001,
    EntityLeftEvent: 101002,
    EntityTeleportedEvent: 101003,
    InteractableBeginInteractionCommand: 101004,
    InteractableEndInteractionCommand: 101005,
    OccupiableBeginInteractionCommand: 101006,
    OccupiableEndInteractionCommand: 101007,
    OccupiableOccupantsUpdatedEvent: 101008,
    OccupiableOccupantQueueUpdatedEvent: 101009,
    MobileMovedEvent: 101010,
    MobileMoveTypeUpdatedEvent: 101011,
    PlayerMoveCommand: 101012,
    PlayerUpdateMoveTypeCommand: 101013,
    PlayerKeepAliveCommand: 101014,
    PlayerTeleportToChannelCommand: 101015,
    PlayerTeleportToMapCommand: 101016,
    PlayerTeleportToPositionCommand: 101017,
    PlayerTeleportToPlayerCommand: 101018,
    PlayerUpdateAppearanceCommand: 101019,
    PlayerUpdateDanceCommand: 101020,
    PlayerUnstuckCommand: 101021,
    PlayerAppearanceUpdatedEvent: 101022,
    PlayerDanceUpdatedEvent: 101023,
};

module.exports = MessageOpcode;