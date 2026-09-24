puts "\nEnriching groups with members and discography..."

GROUP_DETAILS = [
  {
    name: "BTS",
    korean_name: "방탄소년단",
    company: "HYBE",
    debut_date: "2013-06-13",
    group_type: "boy_group",
    fandom_name: "ARMY",
    members: [
      { stage_name: "RM", full_name: "Kim Nam-joon", birth_date: "1994-09-12", position: "Leader, Main Rapper" },
      { stage_name: "Jin", full_name: "Kim Seok-jin", birth_date: "1992-12-04", position: "Vocalist, Visual" },
      { stage_name: "Suga", full_name: "Min Yoon-gi", birth_date: "1993-03-09", position: "Lead Rapper" },
      { stage_name: "j-hope", full_name: "Jung Ho-seok", birth_date: "1994-02-18", position: "Main Dancer, Rapper" },
      { stage_name: "Jimin", full_name: "Park Ji-min", birth_date: "1995-10-13", position: "Main Dancer, Vocalist" },
      { stage_name: "V", full_name: "Kim Tae-hyung", birth_date: "1995-12-30", position: "Vocalist, Visual" },
      { stage_name: "Jungkook", full_name: "Jeon Jung-kook", birth_date: "1997-09-01", position: "Main Vocalist, Maknae" }
    ],
    albums: [
      { title: "Love Yourself: Answer", album_type: "album", release_date: "2018-08-24" },
      { title: "Map of the Soul: 7", album_type: "album", release_date: "2020-02-21" },
      { title: "BE", album_type: "album", release_date: "2020-11-20" },
      { title: "Proof", album_type: "compilation", release_date: "2022-06-10" }
    ]
  },
  {
    name: "NewJeans",
    korean_name: "뉴진스",
    company: "ADOR",
    debut_date: "2022-07-22",
    group_type: "girl_group",
    fandom_name: "Bunnies",
    members: [
      { stage_name: "Minji", full_name: "Kim Min-ji", birth_date: "2004-05-07", position: "Leader" },
      { stage_name: "Hanni", full_name: "Pham Ngoc Han", birth_date: "2004-10-06", position: "Vocalist" },
      { stage_name: "Danielle", full_name: "Danielle Marsh", birth_date: "2005-04-11", position: "Vocalist" },
      { stage_name: "Haerin", full_name: "Kang Hae-rin", birth_date: "2006-05-15", position: "Vocalist" },
      { stage_name: "Hyein", full_name: "Lee Hye-in", birth_date: "2008-04-21", position: "Maknae" }
    ],
    albums: [
      { title: "New Jeans", album_type: "ep", release_date: "2022-08-01" },
      { title: "OMG", album_type: "single", release_date: "2023-01-02" },
      { title: "Get Up", album_type: "ep", release_date: "2023-07-21" },
      { title: "How Sweet", album_type: "single", release_date: "2024-05-24" }
    ]
  },
  {
    name: "aespa",
    korean_name: "에스파",
    company: "SM Entertainment",
    debut_date: "2020-11-17",
    group_type: "girl_group",
    fandom_name: "MY",
    members: [
      { stage_name: "Karina", full_name: "Yu Ji-min", birth_date: "2000-04-11", position: "Leader" },
      { stage_name: "Giselle", full_name: "Uchinaga Aeri", birth_date: "2000-10-30", position: "Rapper, Vocalist" },
      { stage_name: "Winter", full_name: "Kim Min-jeong", birth_date: "2001-01-01", position: "Vocalist" },
      { stage_name: "Ningning", full_name: "Ning Yi-zhuo", birth_date: "2002-10-23", position: "Main Vocalist" }
    ],
    albums: [
      { title: "Savage", album_type: "ep", release_date: "2021-10-05" },
      { title: "Girls", album_type: "ep", release_date: "2022-07-08" },
      { title: "My World", album_type: "ep", release_date: "2023-05-08" },
      { title: "Armageddon", album_type: "album", release_date: "2024-05-27" }
    ]
  }
]

GROUP_DETAILS.each do |detail|
  group = Group.find_by(name: detail[:name])
  next unless group

  group.update!(
    korean_name: detail[:korean_name],
    company: detail[:company],
    debut_date: detail[:debut_date],
    group_type: detail[:group_type],
    fandom_name: detail[:fandom_name]
  )

  detail[:members].each_with_index do |member, index|
    group.members.find_or_initialize_by(stage_name: member[:stage_name]).update!(
      full_name: member[:full_name],
      birth_date: member[:birth_date],
      position: member[:position],
      sort_order: index
    )
  end

  detail[:albums].each do |album|
    group.albums.find_or_initialize_by(title: album[:title]).update!(
      album_type: album[:album_type],
      release_date: album[:release_date]
    )
  end

  puts "  Enriched: #{group.name} (#{group.members.count} members, #{group.albums.count} albums)"
end
