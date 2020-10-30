export const rightsResponse = {
  none: {
    rights: []
  },
  event: {
    rights: [
      {
        grantee_id: '740ee37f-0473-4ac0-b039-d0915efa949b',
        entity_type: 'event',
        entity_value: '0x7fd340f197383d4686f81a1a2798be33e13421531ac8f3e1ddcb99bc8b2e4b9b',
        rights: {
          owner: true
        },
        created_at: '2020-07-20T15:46:33.051Z',
        updated_at: '2020-07-20T15:46:33.051Z'
      }
    ]
  }
}

export const actionResponse = {
  actionsets: [
    {
      id: "aa08b466-704c-4eae-942a-7c08d54bc514",
      consumed: false,
      actions: [
        {
          data: '{"name":"Super Event","description":"this is a super event","tags":[]}',
          name: "@events/textMetadata",
          private: false,
          status: "complete",
          type: "input",
        },
        {
          name: "@events/imagesMetadata",
          private: false,
          status: "in progress",
          type: "input",
        },
        {
          name: "@events/modulesConfiguration",
          private: false,
          status: "waiting",
          type: "input",
        },
        {
          name: "@events/datesConfiguration",
          private: false,
          status: "waiting",
          type: "input",
        },
        {
          name: "@events/categoriesConfiguration",
          private: false,
          status: "waiting",
          type: "input",
        },
        {
          name: "@events/adminsConfiguration",
          private: false,
          status: "waiting",
          type: "input",
        }
      ],
      created_at: "2020-08-11T14:14:23.693Z",
      current_action: 1,
      current_status: "input:in progress",
      dispatched_at: "2020-08-11T14:14:23.689Z",
      links: [],
      name: "@events/creation",
      updated_at: "2020-08-11T14:18:27.693Z",
    }]
};
