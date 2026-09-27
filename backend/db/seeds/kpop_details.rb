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
      { stage_name: "RM", full_name: "Kim Nam-joon", birth_date: "1994-09-12", position: "Leader, Main Rapper", photo_url: "https://static.wikia.nocookie.net/kpop/images/e/ec/BTS_RM_Arirang_concept_photo_1.png/revision/latest?cb=20260320062404" },
      { stage_name: "Jin", full_name: "Kim Seok-jin", birth_date: "1992-12-04", position: "Vocalist, Visual", photo_url: "https://static.wikia.nocookie.net/kpop/images/1/1d/BTS_Jin_Arirang_concept_photo_1.png/revision/latest?cb=20260320060606" },
      { stage_name: "Suga", full_name: "Min Yoon-gi", birth_date: "1993-03-09", position: "Lead Rapper", photo_url: "https://static.wikia.nocookie.net/kpop/images/6/69/BTS_Suga_Arirang_concept_photo_1.png/revision/latest?cb=20260320060944" },
      { stage_name: "j-hope", full_name: "Jung Ho-seok", birth_date: "1994-02-18", position: "Main Dancer, Rapper", photo_url: "https://static.wikia.nocookie.net/kpop/images/1/19/BTS_J-Hope_Arirang_concept_photo_1.png/revision/latest?cb=20260320061938" },
      { stage_name: "Jimin", full_name: "Park Ji-min", birth_date: "1995-10-13", position: "Main Dancer, Vocalist", photo_url: "https://static.wikia.nocookie.net/kpop/images/c/c3/BTS_Jimin_Arirang_concept_photo_1.png/revision/latest?cb=20260320062854" },
      { stage_name: "V", full_name: "Kim Tae-hyung", birth_date: "1995-12-30", position: "Vocalist, Visual", photo_url: "https://static.wikia.nocookie.net/kpop/images/b/bc/BTS_V_Arirang_concept_photo_1.png/revision/latest?cb=20260320063508" },
      { stage_name: "Jungkook", full_name: "Jeon Jung-kook", birth_date: "1997-09-01", position: "Main Vocalist, Maknae", photo_url: "https://static.wikia.nocookie.net/kpop/images/2/29/BTS_Jung_Kook_Arirang_concept_photo_1.png/revision/latest?cb=20260320064156" }
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
      { stage_name: "Minji", full_name: "Kim Min-ji", birth_date: "2004-05-07", position: "Leader", photo_url: "https://static.wikia.nocookie.net/kpop/images/2/2f/NewJeans_Minji_2026_Summer_of_NewJeans_concept_photo_2.png/revision/latest?cb=20260721155024" },
      { stage_name: "Hanni", full_name: "Pham Ngoc Han", birth_date: "2004-10-06", position: "Vocalist", photo_url: "https://static.wikia.nocookie.net/kpop/images/4/45/NewJeans_Hanni_2026_Summer_of_NewJeans_concept_photo_3.png/revision/latest?cb=20260721160534" },
      { stage_name: "Danielle", full_name: "Danielle Marsh", birth_date: "2005-04-11", position: "Vocalist", photo_url: "https://static.wikia.nocookie.net/kpop/images/0/0c/NJZ_Danielle_profile_photo_February_2025_%281%29.png/revision/latest?cb=20250207224004" },
      { stage_name: "Haerin", full_name: "Kang Hae-rin", birth_date: "2006-05-15", position: "Vocalist", photo_url: "https://static.wikia.nocookie.net/kpop/images/9/9c/NewJeans_Haerin_2026_Summer_of_NewJeans_concept_photo_1.png/revision/latest?cb=20260721192411" },
      { stage_name: "Hyein", full_name: "Lee Hye-in", birth_date: "2008-04-21", position: "Maknae", photo_url: "https://static.wikia.nocookie.net/kpop/images/b/b9/NewJeans_Hyein_2026_Summer_of_NewJeans_concept_photo_6.png/revision/latest?cb=20260721195827" }
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
      { stage_name: "Karina", full_name: "Yu Ji-min", birth_date: "2000-04-11", position: "Leader", photo_url: "https://static.wikia.nocookie.net/kpop/images/f/f9/Aespa_Karina_Kiss_N_Tell_concept_photo_1.webp/revision/latest?cb=20260702162703" },
      { stage_name: "Giselle", full_name: "Uchinaga Aeri", birth_date: "2000-10-30", position: "Rapper, Vocalist", photo_url: "https://static.wikia.nocookie.net/kpop/images/4/4f/Aespa_Giselle_Kiss_N_Tell_concept_photo_1.webp/revision/latest?cb=20260702162513" },
      { stage_name: "Winter", full_name: "Kim Min-jeong", birth_date: "2001-01-01", position: "Vocalist", photo_url: "https://static.wikia.nocookie.net/kpop/images/6/62/Aespa_Winter_Kiss_N_Tell_concept_photo_1.webp/revision/latest?cb=20260702162559" },
      { stage_name: "Ningning", full_name: "Ning Yi-zhuo", birth_date: "2002-10-23", position: "Main Vocalist", photo_url: "https://static.wikia.nocookie.net/kpop/images/e/eb/Aespa_Ningning_Kiss_N_Tell_concept_photo_1.webp/revision/latest?cb=20260702162555" }
    ],
    albums: [
      { title: "Savage", album_type: "ep", release_date: "2021-10-05" },
      { title: "Girls", album_type: "ep", release_date: "2022-07-08" },
      { title: "My World", album_type: "ep", release_date: "2023-05-08" },
      { title: "Armageddon", album_type: "album", release_date: "2024-05-27" }
    ]
  },
  {
    name: "CORTIS",
    korean_name: "코르티스",
    company: "BigHit Music",
    debut_date: "2025-08-18",
    group_type: "boy_group",
    fandom_name: "COER",
    members: [
      { stage_name: "Martin", full_name: "Martin Jonathan Edwards", birth_date: "2008-03-20", position: "Leader, Rapper, Vocalist", photo_url: "https://static.wikia.nocookie.net/kpop/images/0/05/CORTIS_Martin_Greengreen_concept_photo_3.webp/revision/latest?cb=20260406121836" },
      { stage_name: "James", full_name: "James Chao", birth_date: "2005-10-14", position: "Main Dancer, Rapper, Vocalist", photo_url: "https://static.wikia.nocookie.net/kpop/images/7/7f/CORTIS_James_Greengreen_concept_photo_3.webp/revision/latest?cb=20260406121811" },
      { stage_name: "Juhoon", full_name: "Kim Ju-hoon", birth_date: "2008-01-03", position: "Vocalist, Rapper, Visual", photo_url: "https://static.wikia.nocookie.net/kpop/images/7/7a/CORTIS_Juhoon_Greengreen_concept_photo_1.webp/revision/latest?cb=20260406121850" },
      { stage_name: "Seonghyeon", full_name: "Eom Seong-hyeon", birth_date: "2009-01-13", position: "Vocalist, Dancer", photo_url: "https://static.wikia.nocookie.net/kpop/images/d/d0/CORTIS_Seonghyeon_Greengreen_concept_photo_3.webp/revision/latest?cb=20260406121836" },
      { stage_name: "Keonho", full_name: "An Keon-ho", birth_date: "2009-02-14", position: "Vocalist, Dancer, Visual, Maknae", photo_url: "https://static.wikia.nocookie.net/kpop/images/f/fb/CORTIS_Keonho_Greengreen_concept_photo_1.webp/revision/latest?cb=20260406121837" }
    ],
    albums: [
      { title: "Color Outside the Lines", album_type: "ep", release_date: "2025-09-08" },
      { title: "What You Want", album_type: "single", release_date: "2025-08-18" }
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
      photo_url: member[:photo_url],
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

GROUP_TYPES = {
  "girl_group" => ["(G)I-DLE", "BLACKPINK", "ITZY", "IVE", "KATSEYE", "Kep1er", "LE SSERAFIM", "MAMAMOO", "NMIXX", "Red Velvet", "TWICE"],
  "boy_group" => ["ATEEZ", "ENHYPEN", "EXO", "GOT7", "Monsta X", "NCT", "SEVENTEEN", "Stray Kids", "TXT"]
}

GROUP_TYPES.each do |type, names|
  names.each do |name|
    group = Group.find_by(name: name)
    group&.update!(group_type: type)
  end
end

puts "  Classified #{GROUP_TYPES.values.sum(&:size)} groups by type"
