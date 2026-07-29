// AUTO-GENERATED — do not edit by hand.
// Re-generate: node artifacts/sudoku-game/scripts/gen-default-puzzles.mjs
//
// Pre-built puzzle bank for every gridSize × difficulty combination.
// Used as an instant fallback so the game starts immediately even when
// the API server is unreachable.

export interface DefaultPuzzle {
  grid: string;
  solution: string;
  gridSize: number;
  difficulty: string;
}

// bank[gridSize][difficulty] = array of puzzles
export const DEFAULT_PUZZLES: Record<number, Record<string, DefaultPuzzle[]>> = {
  "3": {
    "easy": [
      {
        "grid": "012123231",
        "solution": "312123231",
        "gridSize": 3,
        "difficulty": "easy"
      },
      {
        "grid": "310231123",
        "solution": "312231123",
        "gridSize": 3,
        "difficulty": "easy"
      },
      {
        "grid": "012231123",
        "solution": "312231123",
        "gridSize": 3,
        "difficulty": "easy"
      },
      {
        "grid": "032213321",
        "solution": "132213321",
        "gridSize": 3,
        "difficulty": "easy"
      },
      {
        "grid": "132213301",
        "solution": "132213321",
        "gridSize": 3,
        "difficulty": "easy"
      }
    ],
    "medium": [
      {
        "grid": "230023312",
        "solution": "231123312",
        "gridSize": 3,
        "difficulty": "medium"
      },
      {
        "grid": "130321210",
        "solution": "132321213",
        "gridSize": 3,
        "difficulty": "medium"
      },
      {
        "grid": "213130021",
        "solution": "213132321",
        "gridSize": 3,
        "difficulty": "medium"
      },
      {
        "grid": "230312120",
        "solution": "231312123",
        "gridSize": 3,
        "difficulty": "medium"
      },
      {
        "grid": "213032021",
        "solution": "213132321",
        "gridSize": 3,
        "difficulty": "medium"
      }
    ],
    "hard": [
      {
        "grid": "010123230",
        "solution": "312123231",
        "gridSize": 3,
        "difficulty": "hard"
      },
      {
        "grid": "120300231",
        "solution": "123312231",
        "gridSize": 3,
        "difficulty": "hard"
      },
      {
        "grid": "100321203",
        "solution": "132321213",
        "gridSize": 3,
        "difficulty": "hard"
      },
      {
        "grid": "123001012",
        "solution": "123231312",
        "gridSize": 3,
        "difficulty": "hard"
      },
      {
        "grid": "231103010",
        "solution": "231123312",
        "gridSize": 3,
        "difficulty": "hard"
      }
    ],
    "expert": [
      {
        "grid": "023002230",
        "solution": "123312231",
        "gridSize": 3,
        "difficulty": "expert"
      },
      {
        "grid": "201003310",
        "solution": "231123312",
        "gridSize": 3,
        "difficulty": "expert"
      },
      {
        "grid": "300003231",
        "solution": "312123231",
        "gridSize": 3,
        "difficulty": "expert"
      },
      {
        "grid": "200130320",
        "solution": "213132321",
        "gridSize": 3,
        "difficulty": "expert"
      },
      {
        "grid": "321030003",
        "solution": "321132213",
        "gridSize": 3,
        "difficulty": "expert"
      }
    ]
  },
  "4": {
    "easy": [
      {
        "grid": "3102421313242031",
        "solution": "3142421313242431",
        "gridSize": 4,
        "difficulty": "easy"
      },
      {
        "grid": "2041143240133124",
        "solution": "2341143242133124",
        "gridSize": 4,
        "difficulty": "easy"
      },
      {
        "grid": "4312123421433400",
        "solution": "4312123421433421",
        "gridSize": 4,
        "difficulty": "easy"
      },
      {
        "grid": "4132321403411403",
        "solution": "4132321423411423",
        "gridSize": 4,
        "difficulty": "easy"
      },
      {
        "grid": "3142243113240203",
        "solution": "3142243113244213",
        "gridSize": 4,
        "difficulty": "easy"
      }
    ],
    "medium": [
      {
        "grid": "0310410214230240",
        "solution": "2314413214233241",
        "gridSize": 4,
        "difficulty": "medium"
      },
      {
        "grid": "0423231030014130",
        "solution": "1423231432414132",
        "gridSize": 4,
        "difficulty": "medium"
      },
      {
        "grid": "0004243102131302",
        "solution": "3124243142131342",
        "gridSize": 4,
        "difficulty": "medium"
      },
      {
        "grid": "3412210010034320",
        "solution": "3412213412434321",
        "gridSize": 4,
        "difficulty": "medium"
      },
      {
        "grid": "4123000032041432",
        "solution": "4123234132141432",
        "gridSize": 4,
        "difficulty": "medium"
      }
    ],
    "hard": [
      {
        "grid": "0000300123041430",
        "solution": "4123324123141432",
        "gridSize": 4,
        "difficulty": "hard"
      },
      {
        "grid": "1240040243002000",
        "solution": "1243341243212134",
        "gridSize": 4,
        "difficulty": "hard"
      },
      {
        "grid": "1230000104102040",
        "solution": "1234432134122143",
        "gridSize": 4,
        "difficulty": "hard"
      },
      {
        "grid": "2100430000303420",
        "solution": "2143431212343421",
        "gridSize": 4,
        "difficulty": "hard"
      },
      {
        "grid": "0002401300011024",
        "solution": "3142421324311324",
        "gridSize": 4,
        "difficulty": "hard"
      }
    ],
    "expert": [
      {
        "grid": "4000034000210030",
        "solution": "4213134234212134",
        "gridSize": 4,
        "difficulty": "expert"
      },
      {
        "grid": "3400000001340001",
        "solution": "3412124321344321",
        "gridSize": 4,
        "difficulty": "expert"
      },
      {
        "grid": "2400030030400003",
        "solution": "2431132431424213",
        "gridSize": 4,
        "difficulty": "expert"
      },
      {
        "grid": "0000021020011004",
        "solution": "3142421324311324",
        "gridSize": 4,
        "difficulty": "expert"
      },
      {
        "grid": "0023020040000301",
        "solution": "1423321441322341",
        "gridSize": 4,
        "difficulty": "expert"
      }
    ]
  },
  "6": {
    "easy": [
      {
        "grid": "100403234056310064500010001635653241",
        "solution": "165423234156312564546312421635653241",
        "gridSize": 6,
        "difficulty": "easy"
      },
      {
        "grid": "460150015400050020321564136205540610",
        "solution": "463152215436654321321564136245542613",
        "gridSize": 6,
        "difficulty": "easy"
      },
      {
        "grid": "326004405620603052052436260005500261",
        "solution": "326514415623643152152436261345534261",
        "gridSize": 6,
        "difficulty": "easy"
      },
      {
        "grid": "021354543600460013135062250100000245",
        "solution": "621354543621462513135462254136316245",
        "gridSize": 6,
        "difficulty": "easy"
      },
      {
        "grid": "400001512060245136103500051604624310",
        "solution": "436251512463245136163542351624624315",
        "gridSize": 6,
        "difficulty": "easy"
      }
    ],
    "medium": [
      {
        "grid": "005300060004034620600403040235300046",
        "solution": "415362263514534621621453146235352146",
        "gridSize": 6,
        "difficulty": "medium"
      },
      {
        "grid": "136500054300400050360002602130000206",
        "solution": "136524254361421653365412642135513246",
        "gridSize": 6,
        "difficulty": "medium"
      },
      {
        "grid": "005034040251102546600000001400000165",
        "solution": "215634346251132546654312561423423165",
        "gridSize": 6,
        "difficulty": "medium"
      },
      {
        "grid": "600402100050415023062105546000000500",
        "solution": "653412124356415623362145546231231564",
        "gridSize": 6,
        "difficulty": "medium"
      },
      {
        "grid": "300210201003023560000304140630032000",
        "solution": "354216261453423561516324145632632145",
        "gridSize": 6,
        "difficulty": "medium"
      }
    ],
    "hard": [
      {
        "grid": "060024043160000201004000300400002010",
        "solution": "561324243165635241124536316452452613",
        "gridSize": 6,
        "difficulty": "hard"
      },
      {
        "grid": "650200234501500000020000300004060100",
        "solution": "651243234561546312123456315624462135",
        "gridSize": 6,
        "difficulty": "hard"
      },
      {
        "grid": "020305300001002000013206000400630500",
        "solution": "126345345621562134413256251463634512",
        "gridSize": 6,
        "difficulty": "hard"
      },
      {
        "grid": "400060052403000104040000004600306200",
        "solution": "431562652413263154145326524631316245",
        "gridSize": 6,
        "difficulty": "hard"
      },
      {
        "grid": "000040305102430001001300014005000010",
        "solution": "126543345162432651561324614235253416",
        "gridSize": 6,
        "difficulty": "hard"
      }
    ],
    "expert": [
      {
        "grid": "035000000000061000020004000210000046",
        "solution": "635421214653461532523164346215152346",
        "gridSize": 6,
        "difficulty": "expert"
      },
      {
        "grid": "001000200600006203100400040000000040",
        "solution": "561324234651456213123465645132312546",
        "gridSize": 6,
        "difficulty": "expert"
      },
      {
        "grid": "000050040001300600006003500200010000",
        "solution": "163452245361321645456123534216612534",
        "gridSize": 6,
        "difficulty": "expert"
      },
      {
        "grid": "300000012600050040000003004302000000",
        "solution": "346125512634653241421563164352235416",
        "gridSize": 6,
        "difficulty": "expert"
      },
      {
        "grid": "000400000005006040001000500300014020",
        "solution": "625431143265256143431652562314314526",
        "gridSize": 6,
        "difficulty": "expert"
      }
    ]
  },
  "9": {
    "easy": [
      {
        "grid": "000070265001042380085900704017204930002001850653000142549820671326410098078690400",
        "solution": "934178265761542389285936714817254936492361857653789142549823671326417598178695423",
        "gridSize": 9,
        "difficulty": "easy"
      },
      {
        "grid": "740306090030057846600041537076035219519020403300170080000863724203004908480500301",
        "solution": "745386192132957846698241537876435219519628473324179685951863724263714958487592361",
        "gridSize": 9,
        "difficulty": "easy"
      },
      {
        "grid": "007238460082000015609000238821367954403592107795180306030900071000020603016870040",
        "solution": "157238469382649715649715238821367954463592187795184326234956871578421693916873542",
        "gridSize": 9,
        "difficulty": "easy"
      },
      {
        "grid": "784590026031684007659702040397015408020040719100809235000008070413000502070153690",
        "solution": "784591326231684957659732841397215468528346719146879235965428173413967582872153694",
        "gridSize": 9,
        "difficulty": "easy"
      },
      {
        "grid": "035700008874951260091038700103802400408007932900403580302670800500384627080129050",
        "solution": "235746198874951263691238745153892476468517932927463581342675819519384627786129354",
        "gridSize": 9,
        "difficulty": "easy"
      }
    ],
    "medium": [
      {
        "grid": "062400009080061005004008130230000000041500308970006540709604813806730000400080060",
        "solution": "162453789387961425594278136235847691641592378978316542759624813816739254423185967",
        "gridSize": 9,
        "difficulty": "medium"
      },
      {
        "grid": "060130040903002056701000020076000592518420073209060401100003007380004005000070800",
        "solution": "862135749943782156751946328476318592518429673239567481124853967387694215695271834",
        "gridSize": 9,
        "difficulty": "medium"
      },
      {
        "grid": "002079605075010200000003801100906028040100903207380004080004300531060090409001006",
        "solution": "812479635375618249964253871153946728648127953297385164786594312531862497429731586",
        "gridSize": 9,
        "difficulty": "medium"
      },
      {
        "grid": "000195620509020100210000098000019030061038902490050006002540089030962000054000200",
        "solution": "387195624549826173216374598825619437761438952493257816672541389138962745954783261",
        "gridSize": 9,
        "difficulty": "medium"
      },
      {
        "grid": "170006340689053027534270000000000080060002930723010504940000050300000679200089000",
        "solution": "172896345689453127534271896491365782865742931723918564946137258318524679257689413",
        "gridSize": 9,
        "difficulty": "medium"
      }
    ],
    "hard": [
      {
        "grid": "500064001020300045347000600003000000000090810170003406450006000030500720000000000",
        "solution": "589264371621387945347159682893641257264795813175823496452976138936518724718432569",
        "gridSize": 9,
        "difficulty": "hard"
      },
      {
        "grid": "305671090000940030000000000064000070080000605007316004800034120000000000000200907",
        "solution": "325671498716948532948523761164852379283497615597316284859734126472169853631285947",
        "gridSize": 9,
        "difficulty": "hard"
      },
      {
        "grid": "059400600000108070087060000010500000000270190700000030003010028090000360000002910",
        "solution": "159427683326158479487963251912536847835274196764891532543619728291785364678342915",
        "gridSize": 9,
        "difficulty": "hard"
      },
      {
        "grid": "600098300009002005000030679540000806001000402003006700200000040090080060005000200",
        "solution": "657198324439762185128534679542917836761853492983426751216375948394281567875649213",
        "gridSize": 9,
        "difficulty": "hard"
      },
      {
        "grid": "002300000000008900080002030071040090005000120260700840030507080600000300040103000",
        "solution": "912354768354678912786912534871245693495836127263791845139527486627489351548163279",
        "gridSize": 9,
        "difficulty": "hard"
      }
    ],
    "expert": [
      {
        "grid": "080000690027000308000100200000090030064000000900530000530920000000610000000000050",
        "solution": "185372694627459318493168275851296437364781529972534861538927146249615783716843952",
        "gridSize": 9,
        "difficulty": "expert"
      },
      {
        "grid": "000500460500000000000060030100000900684000000900002048000609200010050004470200300",
        "solution": "398527461561394782742861539123486975684975123957132648835649217216753894479218356",
        "gridSize": 9,
        "difficulty": "expert"
      },
      {
        "grid": "006001030000060000000007910000000490030000607028000000200076008009500000601400000",
        "solution": "896241735517369824342857916165783492934125687728694351253976148479518263681432579",
        "gridSize": 9,
        "difficulty": "expert"
      },
      {
        "grid": "006030000000009080179800000084020600000000000013905800000007000008100009250000001",
        "solution": "826534917345719286179862354784321695592486173613975842931247568468153729257698431",
        "gridSize": 9,
        "difficulty": "expert"
      },
      {
        "grid": "460002050010008600003005900009000080001087405000000109000720000000001360000300004",
        "solution": "467192853915438672283675941359214786621987435748563129134726598592841367876359214",
        "gridSize": 9,
        "difficulty": "expert"
      }
    ]
  },
  "16": {
    "easy": [
      {
        "grid": "56786789789a800090bc0bc0b0decdef1034234500504507defgefg10g12g10000fg0f01fg12g12312002345040640079ab000cdbcdecdef56786780709080ab90bcabcdbcdecdef023420453456456750086789789a89abd00g0fg1fg0001200234200504564567067800890890890b9abc0bcdbc0ecdef0efge0g1fg020123",
        "solution": "56786789789a89ab9abcabcdbcdecdef1234234534564567defgefg1fg12g123defgefg1fg12g12312342345345645679abcabcdbcdecdef56786789789a89ab9abcabcdbcdecdef123423453456456756786789789a89abdefgefg1fg12g123123423453456456756786789789a89ab9abcabcdbcdecdefdefgefg1fg12g123",
        "gridSize": 16,
        "difficulty": "easy"
      },
      {
        "grid": "00bcabcdb0decdef56706789709a09a01234034534064567de000fg1f002g12390bcab0dbcd0cdef12342305340645600e0g0fg1f002012056086789789a89ab56780789789a890b9abcabcdbc00c0ef0efgef01fg12g12302002040045640670a0cabc00cd000efde0gefg1fg12g020123400453456056756786700780089a0",
        "solution": "9abcabcdbcdecdef56786789789a89ab1234234534564567defgefg1fg12g1239abcabcdbcdecdef1234234534564567defgefg1fg12g12356786789789a89ab56786789789a89ab9abcabcdbcdecdefdefgefg1fg12g12312342345345645679abcabcdbcdecdefdefgefg1fg12g123123423453456456756786789789a89ab",
        "gridSize": 16,
        "difficulty": "easy"
      },
      {
        "grid": "9ab0ab00b0de00efdefgefg1fg00g123003023453406456700786080789a89a00034234530564507def0efg10g10g1239abcabcd00de0def06700089789089a0defgef010g12g1030a0cabcdbcdecde056780789709a89ab120423053450456756786789089a89ab00302040045645600abc00cd0cdecd0fde0g0f01fg12g123",
        "solution": "9abcabcdbcdecdefdefgefg1fg12g123123423453456456756786789789a89ab1234234534564567defgefg1fg12g1239abcabcdbcdecdef56786789789a89abdefgefg1fg12g1239abcabcdbcdecdef56786789789a89ab123423453456456756786789789a89ab12342345345645679abcabcdbcdecdefdefgefg1fg12g123",
        "gridSize": 16,
        "difficulty": "easy"
      },
      {
        "grid": "defgefg10g10g12050706780089089ab9abcabcdbcd0c0e0103400403406056706786089789a89ab1234204534504567de00efg0f000g10390bc0bcdbcdecdef103420453456050700fg0fg10g12000306786700709a80ab0a0ca0cdbcdecdef56780780789a890b1234234530560567defg0f01fg02g1239ab00bcd0cdecdef",
        "solution": "defgefg1fg12g12356786789789a89ab9abcabcdbcdecdef123423453456456756786789789a89ab1234234534564567defgefg1fg12g1239abcabcdbcdecdef1234234534564567defgefg1fg12g12356786789789a89ab9abcabcdbcdecdef56786789789a89ab1234234534564567defgefg1fg12g1239abcabcdbcdecdef",
        "gridSize": 16,
        "difficulty": "easy"
      },
      {
        "grid": "def0efg00g1001230000ab00b0decdef123003450456456056786789709a89ab12342040345005679abcab0dbcd0c0e056780089089a89a0defgef01fg12g12312342345305645609abc0bcdbcdecdefde0ge0g0fg02g00356786780789a89ab123020003456056700fge001f01201239abc0000bcdecd0f56706009789a890b",
        "solution": "defgefg1fg12g1239abcabcdbcdecdef123423453456456756786789789a89ab12342345345645679abcabcdbcdecdef56786789789a89abdefgefg1fg12g12312342345345645679abcabcdbcdecdefdefgefg1fg12g12356786789789a89ab1234234534564567defgefg1fg12g1239abcabcdbcdecdef56786789789a89ab",
        "gridSize": 16,
        "difficulty": "easy"
      }
    ],
    "medium": [
      {
        "grid": "0ef00fg0fg02g10356086780089a09009ab0ab0db0dec0e0123003000056450000f000g1f010g103900c0000bc0ecd0f0608678970908900123003453406456050780789080a09ab1030200034504060900000cdbcdec0e0d0f0efg1f000g12306086789780a89ab0a0c0b00b0decd0f1030234534560560d0fgefg10010g100",
        "solution": "defgefg1fg12g12356786789789a89ab9abcabcdbcdecdef1234234534564567defgefg1fg12g1239abcabcdbcdecdef56786789789a89ab123423453456456756786789789a89ab12342345345645679abcabcdbcdecdefdefgefg1fg12g12356786789789a89ab9abcabcdbcdecdef1234234534564567defgefg1fg12g123",
        "gridSize": 16,
        "difficulty": "medium"
      },
      {
        "grid": "123403003400406790b0a0cd0cde0defde000f01f000g12006086789789089ab50086709009a89ab00000000bc00cdef1034004034564567de0g0f01fg10g12300002305005645000000ef010g12g0209000a0cd00d00d0f567067007800800b06080700789a80abdefgefg1fg1000239a00a0cdbcd0cdef1234034530064500",
        "solution": "12342345345645679abcabcdbcdecdefdefgefg1fg12g12356786789789a89ab56786789789a89ab9abcabcdbcdecdef1234234534564567defgefg1fg12g1231234234534564567defgefg1fg12g1239abcabcdbcdecdef56786789789a89ab56786789789a89abdefgefg1fg12g1239abcabcdbcdecdef1234234534564567",
        "gridSize": 16,
        "difficulty": "medium"
      },
      {
        "grid": "56006709789a80abdef0efg1fg10012090bcab0d00decdef100000450450456756780009080009abde0ge001fg1001000abca0cdbcde0def1234004034500060d0fg0000fg02g02050786009780089a000bc00c0bcdec00f02042305045645670e0gef00f0120023023023403456006000bca0c0000e000f56700709709a09ab",
        "solution": "56786789789a89abdefgefg1fg12g1239abcabcdbcdecdef123423453456456756786789789a89abdefgefg1fg12g1239abcabcdbcdecdef1234234534564567defgefg1fg12g12356786789789a89ab9abcabcdbcdecdef1234234534564567defgefg1fg12g12312342345345645679abcabcdbcdecdef56786789789a89ab",
        "gridSize": 16,
        "difficulty": "medium"
      },
      {
        "grid": "56706709789a800b9abc0bcdb0decd0f1004030530504067d0fg0fg1fg12g1200efge0g00000010390bcabcd0c00cd0f023003400056050056786089709a090b020423450456406790b000cdbcdec0efdefg00g00g02g00050086700709a00ab00006080089009000e0g0f010g12g10302342305005600679abcabc00cd0c00f",
        "solution": "56786789789a89ab9abcabcdbcdecdef1234234534564567defgefg1fg12g123defgefg1fg12g1239abcabcdbcdecdef123423453456456756786789789a89ab12342345345645679abcabcdbcdecdefdefgefg1fg12g12356786789789a89ab56786789789a89abdefgefg1fg12g12312342345345645679abcabcdbcdecdef",
        "gridSize": 16,
        "difficulty": "medium"
      },
      {
        "grid": "9abca0000c0ecd0f50706789789089ab00302345305640670efgef01f01000030ab0abc0b00000e0023423450406456756786009009a80abd00g00g1f010g10312042300340000600ab0a00d00000d0006706789789a80abde0ge001fg02g123de0000g1f01201039a0ca0cdbcd0cde056080789780a800b0034000504064060",
        "solution": "9abcabcdbcdecdef56786789789a89ab1234234534564567defgefg1fg12g1239abcabcdbcdecdef123423453456456756786789789a89abdefgefg1fg12g12312342345345645679abcabcdbcdecdef56786789789a89abdefgefg1fg12g123defgefg1fg12g1239abcabcdbcdecdef56786789789a89ab1234234534564567",
        "gridSize": 16,
        "difficulty": "medium"
      }
    ],
    "hard": [
      {
        "grid": "00700009709a80ab00bca00d00de0000defg00g00002g000120020050406056000786789780a8900d00g00010002g1200000a000b000cd0f1200000530064560060000897890890bd0fgefg00g10002012042345040645070abc0000bcdec00fd0f0e0g10000g0031004204534504507007807007000090b9a00000000000def",
        "solution": "56786789789a89ab9abcabcdbcdecdefdefgefg1fg12g123123423453456456756786789789a89abdefgefg1fg12g1239abcabcdbcdecdef123423453456456756786789789a89abdefgefg1fg12g12312342345345645679abcabcdbcdecdefdefgefg1fg12g123123423453456456756786789789a89ab9abcabcdbcdecdef",
        "gridSize": 16,
        "difficulty": "hard"
      },
      {
        "grid": "0ab00bcd00000de0100003400400406700000fg10g02g12050080709000a89009abcab0dbc00c00f1234000000560507d0000fg1f000g02350786089700080ab0ef0e001f010g120007807097890800012040000300640079a0cabc0bcdec0ef00f0e0g0f0020020123003450400000050086700780000a090b000000cd0000f",
        "solution": "9abcabcdbcdecdef1234234534564567defgefg1fg12g12356786789789a89ab9abcabcdbcdecdef1234234534564567defgefg1fg12g12356786789789a89abdefgefg1fg12g12356786789789a89ab12342345345645679abcabcdbcdecdefdefgefg1fg12g123123423453456456756786789789a89ab9abcabcdbcdecdef",
        "gridSize": 16,
        "difficulty": "hard"
      },
      {
        "grid": "120003053006406090b00bcd000000e000000780780000a0d0fg0f00fg12012090b000c000d0c000d00g0000fg12012300706709009a890b1230234530500560507867807090890bd0fg0001fg12010000042000345640070ab000c0bc000def0000ab00b00e0de0007000000890090000302305340645000efg00g10g12g003",
        "solution": "12342345345645679abcabcdbcdecdef56786789789a89abdefgefg1fg12g1239abcabcdbcdecdefdefgefg1fg12g12356786789789a89ab123423453456456756786789789a89abdefgefg1fg12g12312342345345645679abcabcdbcdecdef9abcabcdbcdecdef56786789789a89ab1234234534564567defgefg1fg12g123",
        "gridSize": 16,
        "difficulty": "hard"
      },
      {
        "grid": "de00e0000g1200239abc00c000de0d00123023053006056006706089780a000bd000e0g100120103000423453006056706786000709a89ab0000abcdb0de00e09a0c000db0dec00f007000090090000000042045305040670ef0ef01f0120000d00g0fg0fg100000007060000800090000002045345000079abc0b00b0dec000",
        "solution": "defgefg1fg12g1239abcabcdbcdecdef123423453456456756786789789a89abdefgefg1fg12g123123423453456456756786789789a89ab9abcabcdbcdecdef9abcabcdbcdecdef56786789789a89ab1234234534564567defgefg1fg12g123defgefg1fg12g12356786789789a89ab12342345345645679abcabcdbcdecdef",
        "gridSize": 16,
        "difficulty": "hard"
      },
      {
        "grid": "9abc00cd0c00000050086700080009a0d0f000g0f010002012340045000045600abc00000c00000fd0f00f00fg10g003120400403006056700700780089080a056706089009a89abde00e001fg00g02000000000300045600ab0abc000d0cdef0a000bcd0cde00ef120423050056006756700000080a090b0e00efg1fg020103",
        "solution": "9abcabcdbcdecdef56786789789a89abdefgefg1fg12g12312342345345645679abcabcdbcdecdefdefgefg1fg12g123123423453456456756786789789a89ab56786789789a89abdefgefg1fg12g12312342345345645679abcabcdbcdecdef9abcabcdbcdecdef123423453456456756786789789a89abdefgefg1fg12g123",
        "gridSize": 16,
        "difficulty": "hard"
      }
    ],
    "expert": [
      {
        "grid": "000000000056000700706709780a000b00f0ef01fg0200230a00a0cd0cd00d000ab0ab00b000000f56080700080a800b000g00000g100000103000003006406050000080000a89000234200530504500d00g0f01f0100123000ca000b0d0000f000000000c000def1234030000060507000000000g00002300706089700a8000",
        "solution": "123423453456456756786789789a89abdefgefg1fg12g1239abcabcdbcdecdef9abcabcdbcdecdef56786789789a89abdefgefg1fg12g123123423453456456756786789789a89ab1234234534564567defgefg1fg12g1239abcabcdbcdecdef9abcabcdbcdecdef1234234534564567defgefg1fg12g12356786789789a89ab",
        "gridSize": 16,
        "difficulty": "expert"
      },
      {
        "grid": "02300300300040605678008008000000de000000fg00g00000b0a0cdb000c00fd0f00fg00g10g0200a000bcdb0000d0f00006000000009000200234004560000507800090090800b0004000500004000de0gefg00000010090bc0b0dbc00c0e000042045000045600a0cab0d0c0e000f50786709000000a0000g00g00g100000",
        "solution": "123423453456456756786789789a89abdefgefg1fg12g1239abcabcdbcdecdefdefgefg1fg12g1239abcabcdbcdecdef56786789789a89ab123423453456456756786789789a89ab1234234534564567defgefg1fg12g1239abcabcdbcdecdef12342345345645679abcabcdbcdecdef56786789789a89abdefgefg1fg12g123",
        "gridSize": 16,
        "difficulty": "expert"
      },
      {
        "grid": "d0000fg0f010000000002045000040070abcab0d0c0ecde006700009700080a01030230030000567560007800890090b00bcab0dbc0000000e0g00000000g1200000a00dbcd00000100020453056050000080000709a00a0d0f0ef01fg00g0200e0g000100100020560807000090090b90000000b0000d000030200000000007",
        "solution": "defgefg1fg12g12312342345345645679abcabcdbcdecdef56786789789a89ab123423453456456756786789789a89ab9abcabcdbcdecdefdefgefg1fg12g1239abcabcdbcdecdef123423453456456756786789789a89abdefgefg1fg12g123defgefg1fg12g12356786789789a89ab9abcabcdbcdecdef1234234534564567",
        "gridSize": 16,
        "difficulty": "expert"
      },
      {
        "grid": "06700009009a00a00ef0e000f00000230abc0b00000ec000003000403400000050000009780a00a01204030000500560def000g10g00g1000a00abc00cd000e006780000780089a000f000010000g00090b0000d0cd00de00030034000504000d00000g0f000g003007860807800090002342005340040000a0c0b00bc00cd00",
        "solution": "56786789789a89abdefgefg1fg12g1239abcabcdbcdecdef123423453456456756786789789a89ab1234234534564567defgefg1fg12g1239abcabcdbcdecdef56786789789a89abdefgefg1fg12g1239abcabcdbcdecdef1234234534564567defgefg1fg12g12356786789789a89ab12342345345645679abcabcdbcdecdef",
        "gridSize": 16,
        "difficulty": "expert"
      },
      {
        "grid": "900c0b0d0000cd00000003000400406000780000080a80a000f0e0g00002012000000fg00g00000090bcabc000de000050000009700000ab12300000000640070e00e0000g10002056706780000000000030000034564000000c0b000c0e0de056700780080a800b9a0c00cdb0decd0f000000053056000000fg0001f012g023",
        "solution": "9abcabcdbcdecdef123423453456456756786789789a89abdefgefg1fg12g123defgefg1fg12g1239abcabcdbcdecdef56786789789a89ab1234234534564567defgefg1fg12g12356786789789a89ab12342345345645679abcabcdbcdecdef56786789789a89ab9abcabcdbcdecdef1234234534564567defgefg1fg12g123",
        "gridSize": 16,
        "difficulty": "expert"
      }
    ]
  }
};

/** Pick a random default puzzle, or null if none available for this combo. */
export function pickDefaultPuzzle(gridSize: number, difficulty: string): DefaultPuzzle | null {
  const pool = DEFAULT_PUZZLES[gridSize]?.[difficulty];
  if (!pool?.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
