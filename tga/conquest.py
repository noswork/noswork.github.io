import random
from collections import defaultdict
import re

# --- 數據庫 ---
# 將所有遊戲數據結構化，方便程式讀取
# 結構：{'副本名稱': {'難度': {'stamina': 體力, 'drops': {'類型': {'rolls': 份數, 'pool': [{'item': 名稱, 'quantity': 數量, 'prob': 機率}, ...]}}}}}
GAME_DATA = {
    '壁虎': {
        '簡單': {
            'stamina': 20,
            'drops': {
                '一般掉落': {
                    'rolls': 4,
                    'pool': [
                        {'item': '強化石', 'quantity': 1, 'prob': 0.15}, {'item': '赤紅結晶', 'quantity': 3, 'prob': 0.25},
                        {'item': '赤紅結晶', 'quantity': 4, 'prob': 0.15}, {'item': '細胞', 'quantity': 1, 'prob': 0.15},
                        {'item': '2階進化石-力', 'quantity': 1, 'prob': 0.10}, {'item': '2階進化石-技', 'quantity': 1, 'prob': 0.10},
                        {'item': '2階進化石-速', 'quantity': 1, 'prob': 0.10}
                    ]
                },
                '機率掉落': {
                    'rolls': 1,
                    'pool': [
                        {'item': '細胞', 'quantity': 1, 'prob': 0.30}, {'item': '戰鬥秘典-初級', 'quantity': 1, 'prob': 0.40},
                        {'item': '黃金兔寶寶', 'quantity': 1, 'prob': 0.30}
                    ]
                },
                '部位掉落': {
                    'rolls': 1,
                    'pool': [
                        {'item': '強化石', 'quantity': 1, 'prob': 0.10}, {'item': '赤紅結晶', 'quantity': 2, 'prob': 0.60},
                        {'item': '赤紅結晶', 'quantity': 3, 'prob': 0.20}, {'item': '赤紅結晶', 'quantity': 4, 'prob': 0.10}
                    ]
                }
            }
        },
        '普通': {
            'stamina': 25,
            'drops': {
                '一般掉落': {
                    'rolls': 4,
                    'pool': [
                        {'item': '強化石', 'quantity': 2, 'prob': 0.15}, {'item': '赤紅結晶', 'quantity': 3, 'prob': 0.20},
                        {'item': '赤紅結晶', 'quantity': 4, 'prob': 0.10}, {'item': '赤紅結晶', 'quantity': 5, 'prob': 0.10},
                        {'item': '細胞', 'quantity': 1, 'prob': 0.15}, {'item': '3階進化石-力', 'quantity': 1, 'prob': 0.05},
                        {'item': '3階進化石-技', 'quantity': 1, 'prob': 0.05}, {'item': '3階進化石-速', 'quantity': 1, 'prob': 0.05},
                        {'item': '2階進化石-力', 'quantity': 1, 'prob': 0.05}, {'item': '2階進化石-技', 'quantity': 1, 'prob': 0.05},
                        {'item': '2階進化石-速', 'quantity': 1, 'prob': 0.05}
                    ]
                },
                '機率掉落': {
                    'rolls': 1,
                    'pool': [
                        {'item': '細胞', 'quantity': 1, 'prob': 0.30}, {'item': '戰鬥秘典-初級', 'quantity': 1, 'prob': 0.40},
                        {'item': '黃金兔寶寶', 'quantity': 1, 'prob': 0.30}
                    ]
                },
                '部位掉落': {
                    'rolls': 1,
                    'pool': [
                        {'item': '強化石', 'quantity': 1, 'prob': 0.05}, {'item': '強化石', 'quantity': 2, 'prob': 0.05},
                        {'item': '赤紅結晶', 'quantity': 3, 'prob': 0.60}, {'item': '赤紅結晶', 'quantity': 4, 'prob': 0.30}
                    ]
                }
            }
        },
        '困難': {
            'stamina': 30,
            'drops': {
                '一般掉落': {
                    'rolls': 5,
                    'pool': [
                        {'item': '強化石', 'quantity': 3, 'prob': 0.05}, {'item': '強化石', 'quantity': 4, 'prob': 0.10},
                        {'item': '赤紅結晶', 'quantity': 4, 'prob': 0.10}, {'item': '赤紅結晶', 'quantity': 5, 'prob': 0.15},
                        {'item': '細胞', 'quantity': 1, 'prob': 0.15}, {'item': '3階進化石-力', 'quantity': 1, 'prob': 0.15},
                        {'item': '3階進化石-技', 'quantity': 1, 'prob': 0.15}, {'item': '3階進化石-速', 'quantity': 1, 'prob': 0.15}
                    ]
                },
                '機率掉落': {
                    'rolls': 2,
                    'pool': [
                        {'item': '細胞', 'quantity': 1, 'prob': 0.30}, {'item': '戰鬥秘典-初級', 'quantity': 1, 'prob': 0.40},
                        {'item': '黃金兔寶寶', 'quantity': 1, 'prob': 0.30}
                    ]
                },
                '部位掉落': {
                    'rolls': 1,
                    'pool': [
                        {'item': '強化石', 'quantity': 2, 'prob': 0.15}, {'item': '赤紅結晶', 'quantity': 4, 'prob': 0.55},
                        {'item': '赤紅結晶', 'quantity': 5, 'prob': 0.30}
                    ]
                }
            }
        },
        '深淵': {
            'stamina': 35,
            'drops': {
                '一般掉落': {
                    'rolls': 6,
                    'pool': [
                        {'item': '強化石', 'quantity': 5, 'prob': 0.15}, {'item': '赤紅結晶', 'quantity': 5, 'prob': 0.15},
                        {'item': '赤紅結晶', 'quantity': 6, 'prob': 0.10}, {'item': '細胞', 'quantity': 1, 'prob': 0.15},
                        {'item': '3階進化石-力', 'quantity': 1, 'prob': 0.15}, {'item': '3階進化石-技', 'quantity': 1, 'prob': 0.15},
                        {'item': '3階進化石-速', 'quantity': 1, 'prob': 0.15}
                    ]
                },
                '機率掉落': {
                    'rolls': 3,
                    'pool': [
                        {'item': '細胞', 'quantity': 1, 'prob': 0.30}, {'item': '戰鬥秘典-中級', 'quantity': 1, 'prob': 0.10},
                        {'item': '戰鬥秘典-初級', 'quantity': 1, 'prob': 0.30}, {'item': '黃金兔寶寶', 'quantity': 1, 'prob': 0.30}
                    ]
                },
                '部位掉落': {
                    'rolls': 1,
                    'pool': [
                        {'item': '強化石', 'quantity': 3, 'prob': 0.20}, {'item': '赤紅結晶', 'quantity': 5, 'prob': 0.80}
                    ]
                }
            }
        },
    },
    '獨眼梟': {
        '簡單': {
            'stamina': 35,
            'drops': {
                '一般掉落': {
                    'rolls': 5,
                    'pool': [
                        {'item': '稀有強化石', 'quantity': 1, 'prob': 0.15}, {'item': '赤紅結晶', 'quantity': 6, 'prob': 0.20},
                        {'item': '赤紅結晶', 'quantity': 7, 'prob': 0.05}, {'item': '細胞', 'quantity': 1, 'prob': 0.15},
                        {'item': '3階進化石-力', 'quantity': 1, 'prob': 0.15}, {'item': '3階進化石-技', 'quantity': 1, 'prob': 0.15},
                        {'item': '3階進化石-速', 'quantity': 1, 'prob': 0.15}
                    ]
                },
                '機率掉落': {
                    'rolls': 3,
                    'pool': [
                        {'item': '細胞', 'quantity': 1, 'prob': 0.30}, {'item': '戰鬥秘典-中級', 'quantity': 1, 'prob': 0.40},
                        {'item': '黃金兔寶寶', 'quantity': 1, 'prob': 0.30}
                    ]
                },
                '部位掉落': {
                    'rolls': 2,
                    'pool': [
                        {'item': '稀有強化石', 'quantity': 1, 'prob': 0.10}, {'item': '赤紅結晶', 'quantity': 5, 'prob': 0.60},
                        {'item': '赤紅結晶', 'quantity': 6, 'prob': 0.30}
                    ]
                }
            }
        },
        '普通': {
            'stamina': 40,
            'drops': {
                '一般掉落': {
                    'rolls': 5,
                    'pool': [
                        {'item': '稀有強化石', 'quantity': 1, 'prob': 0.10}, {'item': '稀有強化石', 'quantity': 2, 'prob': 0.05},
                        {'item': '赤紅結晶', 'quantity': 6, 'prob': 0.10}, {'item': '赤紅結晶', 'quantity': 7, 'prob': 0.10},
                        {'item': '細胞', 'quantity': 1, 'prob': 0.20}, {'item': '4階進化石-力', 'quantity': 1, 'prob': 0.03},
                        {'item': '4階進化石-技', 'quantity': 1, 'prob': 0.03}, {'item': '4階進化石-速', 'quantity': 1, 'prob': 0.03},
                        {'item': '3階進化石-力', 'quantity': 1, 'prob': 0.12}, {'item': '3階進化石-技', 'quantity': 1, 'prob': 0.12},
                        {'item': '3階進化石-速', 'quantity': 1, 'prob': 0.12}
                    ]
                },
                '機率掉落': {
                    'rolls': 3,
                    'pool': [
                        {'item': '細胞', 'quantity': 1, 'prob': 0.30}, {'item': '戰鬥秘典-中級', 'quantity': 1, 'prob': 0.40},
                        {'item': '黃金兔寶寶', 'quantity': 1, 'prob': 0.30}
                    ]
                },
                '部位掉落': {
                    'rolls': 2,
                    'pool': [
                        {'item': '稀有強化石', 'quantity': 1, 'prob': 0.05}, {'item': '稀有強化石', 'quantity': 2, 'prob': 0.05},
                        {'item': '赤紅結晶', 'quantity': 5, 'prob': 0.60}, {'item': '赤紅結晶', 'quantity': 6, 'prob': 0.30}
                    ]
                }
            }
        },
        '困難': {
            'stamina': 45,
            'drops': {
                '一般掉落': {
                    'rolls': 5,
                    'pool': [
                        {'item': '稀有強化石', 'quantity': 2, 'prob': 0.15}, {'item': '赤紅結晶', 'quantity': 6, 'prob': 0.10},
                        {'item': '赤紅結晶', 'quantity': 7, 'prob': 0.10}, {'item': '細胞', 'quantity': 1, 'prob': 0.20},
                        {'item': '4階進化石-力', 'quantity': 1, 'prob': 0.04}, {'item': '4階進化石-技', 'quantity': 1, 'prob': 0.04},
                        {'item': '4階進化石-速', 'quantity': 1, 'prob': 0.04}, {'item': '3階進化石-力', 'quantity': 1, 'prob': 0.11},
                        {'item': '3階進化石-技', 'quantity': 1, 'prob': 0.11}, {'item': '3階進化石-速', 'quantity': 1, 'prob': 0.11}
                    ]
                },
                '機率掉落': {
                    'rolls': 3,
                    'pool': [
                        {'item': '細胞', 'quantity': 1, 'prob': 0.30}, {'item': '戰鬥秘典-中級', 'quantity': 1, 'prob': 0.40},
                        {'item': '黃金兔寶寶', 'quantity': 1, 'prob': 0.30}
                    ]
                },
                '部位掉落': {
                    'rolls': 3,
                    'pool': [
                        {'item': '稀有強化石', 'quantity': 2, 'prob': 0.10}, {'item': '赤紅結晶', 'quantity': 6, 'prob': 0.90}
                    ]
                }
            }
        },
        '深淵': {
            'stamina': 50,
            'drops': {
                '一般掉落': {
                    'rolls': 5,
                    'pool': [
                        {'item': '稀有強化石', 'quantity': 4, 'prob': 0.15}, {'item': '赤紅結晶', 'quantity': 6, 'prob': 0.10},
                        {'item': '赤紅結晶', 'quantity': 7, 'prob': 0.10}, {'item': '細胞', 'quantity': 1, 'prob': 0.20},
                        {'item': '4階進化石-力', 'quantity': 1, 'prob': 0.05}, {'item': '4階進化石-技', 'quantity': 1, 'prob': 0.05},
                        {'item': '4階進化石-速', 'quantity': 1, 'prob': 0.05}, {'item': '3階進化石-力', 'quantity': 1, 'prob': 0.10},
                        {'item': '3階進化石-技', 'quantity': 1, 'prob': 0.10}, {'item': '3階進化石-速', 'quantity': 1, 'prob': 0.10}
                    ]
                },
                '機率掉落': {
                    'rolls': 3,
                    'pool': [
                        {'item': '細胞', 'quantity': 1, 'prob': 0.30}, {'item': '戰鬥秘典-中級', 'quantity': 1, 'prob': 0.40},
                        {'item': '黃金兔寶寶', 'quantity': 1, 'prob': 0.30}
                    ]
                },
                '部位掉落': {
                    'rolls': 3,
                    'pool': [
                        {'item': '稀有強化石', 'quantity': 3, 'prob': 0.10}, {'item': '赤紅結晶', 'quantity': 6, 'prob': 0.90}
                    ]
                }
            }
        },
    },
    '百足': {
        '簡單': {
            'stamina': 50,
            'drops': {
                '一般掉落': {
                    'rolls': 7,
                    'pool': [
                        {'item': '精良強化石', 'quantity': 1, 'prob': 0.15}, {'item': '赤紅結晶', 'quantity': 6, 'prob': 0.10},
                        {'item': '赤紅結晶', 'quantity': 7, 'prob': 0.10}, {'item': '細胞', 'quantity': 1, 'prob': 0.20},
                        {'item': '4階進化石-力', 'quantity': 1, 'prob': 0.05}, {'item': '4階進化石-技', 'quantity': 1, 'prob': 0.05},
                        {'item': '4階進化石-速', 'quantity': 1, 'prob': 0.05}, {'item': '3階進化石-力', 'quantity': 1, 'prob': 0.10},
                        {'item': '3階進化石-技', 'quantity': 1, 'prob': 0.10}, {'item': '3階進化石-速', 'quantity': 1, 'prob': 0.10}
                    ]
                },
                '機率掉落': {
                    'rolls': 3,
                    'pool': [
                        {'item': '細胞', 'quantity': 1, 'prob': 0.30}, {'item': '戰鬥秘典-中級', 'quantity': 1, 'prob': 0.40},
                        {'item': '黃金兔寶寶', 'quantity': 1, 'prob': 0.30}
                    ]
                },
                '部位掉落': {
                    'rolls': 2,
                    'pool': [
                        {'item': '精良強化石', 'quantity': 1, 'prob': 0.10}, {'item': '赤紅結晶', 'quantity': 6, 'prob': 0.60},
                        {'item': '赤紅結晶', 'quantity': 7, 'prob': 0.30}
                    ]
                }
            }
        },
        '普通': {
            'stamina': 55,
            'drops': {
                '一般掉落': {
                    'rolls': 7,
                    'pool': [
                        {'item': '精良強化石', 'quantity': 1, 'prob': 0.10}, {'item': '精良強化石', 'quantity': 2, 'prob': 0.05},
                        {'item': '赤紅結晶', 'quantity': 6, 'prob': 0.10}, {'item': '赤紅結晶', 'quantity': 7, 'prob': 0.10},
                        {'item': '細胞', 'quantity': 1, 'prob': 0.20}, {'item': '4階進化石-力', 'quantity': 1, 'prob': 0.05},
                        {'item': '4階進化石-技', 'quantity': 1, 'prob': 0.05}, {'item': '4階進化石-速', 'quantity': 1, 'prob': 0.05},
                        {'item': '3階進化石-力', 'quantity': 1, 'prob': 0.10}, {'item': '3階進化石-技', 'quantity': 1, 'prob': 0.10},
                        {'item': '3階進化石-速', 'quantity': 1, 'prob': 0.10}
                    ]
                },
                '機率掉落': {
                    'rolls': 3,
                    'pool': [
                        {'item': '細胞', 'quantity': 1, 'prob': 0.30}, {'item': '戰鬥秘典-中級', 'quantity': 1, 'prob': 0.40},
                        {'item': '黃金兔寶寶', 'quantity': 1, 'prob': 0.30}
                    ]
                },
                '部位掉落': {
                    'rolls': 2,
                    'pool': [
                        {'item': '精良強化石', 'quantity': 1, 'prob': 0.05}, {'item': '精良強化石', 'quantity': 2, 'prob': 0.05},
                        {'item': '赤紅結晶', 'quantity': 6, 'prob': 0.60}, {'item': '赤紅結晶', 'quantity': 7, 'prob': 0.30}
                    ]
                }
            }
        },
        '困難': {
            'stamina': 60,
            'drops': {
                '一般掉落': {
                    'rolls': 7,
                    'pool': [
                        {'item': '精良強化石', 'quantity': 2, 'prob': 0.15}, {'item': '赤紅結晶', 'quantity': 8, 'prob': 0.20},
                        {'item': '細胞', 'quantity': 1, 'prob': 0.20}, {'item': '4階進化石-力', 'quantity': 1, 'prob': 0.05},
                        {'item': '4階進化石-技', 'quantity': 1, 'prob': 0.05}, {'item': '4階進化石-速', 'quantity': 1, 'prob': 0.05},
                        {'item': '3階進化石-力', 'quantity': 1, 'prob': 0.10}, {'item': '3階進化石-技', 'quantity': 1, 'prob': 0.10},
                        {'item': '3階進化石-速', 'quantity': 1, 'prob': 0.10}
                    ]
                },
                '機率掉落': {
                    'rolls': 3,
                    'pool': [
                        {'item': '細胞', 'quantity': 1, 'prob': 0.30}, {'item': '戰鬥秘典-中級', 'quantity': 1, 'prob': 0.40},
                        {'item': '黃金兔寶寶', 'quantity': 1, 'prob': 0.30}
                    ]
                },
                '部位掉落': {
                    'rolls': 2,
                    'pool': [
                        {'item': '精良強化石', 'quantity': 2, 'prob': 0.10}, {'item': '赤紅結晶', 'quantity': 7, 'prob': 0.90}
                    ]
                }
            }
        },
        '深淵': {
            'stamina': 70,
            'drops': {
                '一般掉落': {
                    'rolls': 7,
                    'pool': [
                        {'item': '精良強化石', 'quantity': 4, 'prob': 0.15}, {'item': '赤紅結晶', 'quantity': 8, 'prob': 0.20},
                        {'item': '細胞', 'quantity': 1, 'prob': 0.20}, {'item': '4階進化石-力', 'quantity': 1, 'prob': 0.07},
                        {'item': '4階進化石-技', 'quantity': 1, 'prob': 0.07}, {'item': '4階進化石-速', 'quantity': 1, 'prob': 0.07},
                        {'item': '3階進化石-力', 'quantity': 1, 'prob': 0.08}, {'item': '3階進化石-技', 'quantity': 1, 'prob': 0.08},
                        {'item': '3階進化石-速', 'quantity': 1, 'prob': 0.08}
                    ]
                },
                '機率掉落': {
                    'rolls': 3,
                    'pool': [
                        {'item': '細胞', 'quantity': 1, 'prob': 0.30}, {'item': '戰鬥秘典-中級', 'quantity': 1, 'prob': 0.40},
                        {'item': '黃金兔寶寶', 'quantity': 1, 'prob': 0.30}
                    ]
                },
                '部位掉落': {
                    'rolls': 2,
                    'pool': [
                        {'item': '精良強化石', 'quantity': 2, 'prob': 0.05}, {'item': '精良強化石', 'quantity': 3, 'prob': 0.05},
                        {'item': '赤紅結晶', 'quantity': 7, 'prob': 0.45}, {'item': '赤紅結晶', 'quantity': 8, 'prob': 0.45}
                    ]
                }
            }
        },
    },
    '野呂': {
        '簡單': {
            'stamina': 50,
            'drops': {
                '一般掉落': {
                    'rolls': 4,
                    'pool': [
                        {'item': '界限晶幣', 'quantity': 1, 'prob': 0.12}, {'item': '細胞', 'quantity': 1, 'prob': 0.19},
                        {'item': '5階進化石-力', 'quantity': 1, 'prob': 0.10}, {'item': '5階進化石-技', 'quantity': 1, 'prob': 0.10},
                        {'item': '5階進化石-速', 'quantity': 1, 'prob': 0.10}, {'item': '4階進化石-力', 'quantity': 1, 'prob': 0.13},
                        {'item': '4階進化石-技', 'quantity': 1, 'prob': 0.13}, {'item': '4階進化石-速', 'quantity': 1, 'prob': 0.13}
                    ]
                },
                '部位掉落': {
                    'rolls': 1,
                    'pool': [ {'item': '界限晶幣', 'quantity': 1, 'prob': 1.0} ]
                }
            }
        },
        '普通': {
            'stamina': 55,
            'drops': {
                '一般掉落': {
                    'rolls': 5,
                    'pool': [
                        {'item': '界限晶幣', 'quantity': 1, 'prob': 0.15}, {'item': '細胞', 'quantity': 1, 'prob': 0.19},
                        {'item': '5階進化石-力', 'quantity': 1, 'prob': 0.10}, {'item': '5階進化石-技', 'quantity': 1, 'prob': 0.10},
                        {'item': '5階進化石-速', 'quantity': 1, 'prob': 0.10}, {'item': '4階進化石-力', 'quantity': 1, 'prob': 0.12},
                        {'item': '4階進化石-技', 'quantity': 1, 'prob': 0.12}, {'item': '4階進化石-速', 'quantity': 1, 'prob': 0.12}
                    ]
                },
                '部位掉落': {
                    'rolls': 1,
                    'pool': [ {'item': '界限晶幣', 'quantity': 1, 'prob': 1.0} ]
                }
            }
        },
        '困難': {
            'stamina': 60,
            'drops': {
                '一般掉落': {
                    'rolls': 6,
                    'pool': [
                        {'item': '界限晶幣', 'quantity': 1, 'prob': 0.15}, {'item': '細胞', 'quantity': 1, 'prob': 0.19},
                        {'item': '5階進化石-力', 'quantity': 1, 'prob': 0.11}, {'item': '5階進化石-技', 'quantity': 1, 'prob': 0.11},
                        {'item': '5階進化石-速', 'quantity': 1, 'prob': 0.11}, {'item': '4階進化石-力', 'quantity': 1, 'prob': 0.11},
                        {'item': '4階進化石-技', 'quantity': 1, 'prob': 0.11}, {'item': '4階進化石-速', 'quantity': 1, 'prob': 0.11}
                    ]
                },
                '部位掉落': {
                    'rolls': 2,
                    'pool': [ {'item': '界限晶幣', 'quantity': 1, 'prob': 1.0} ]
                }
            }
        },
        '深淵': {
            'stamina': 70,
            'drops': {
                '一般掉落': {
                    'rolls': 7,
                    'pool': [
                        {'item': '界限晶幣', 'quantity': 1, 'prob': 0.10}, {'item': '界限晶幣', 'quantity': 2, 'prob': 0.05},
                        {'item': '細胞', 'quantity': 1, 'prob': 0.19}, {'item': '5階進化石-力', 'quantity': 1, 'prob': 0.11},
                        {'item': '5階進化石-技', 'quantity': 1, 'prob': 0.11}, {'item': '5階進化石-速', 'quantity': 1, 'prob': 0.11},
                        {'item': '4階進化石-力', 'quantity': 1, 'prob': 0.11}, {'item': '4階進化石-技', 'quantity': 1, 'prob': 0.11},
                        {'item': '4階進化石-速', 'quantity': 1, 'prob': 0.11}
                    ]
                },
                '部位掉落': {
                    'rolls': 2,
                    'pool': [ {'item': '界限晶幣', 'quantity': 1, 'prob': 1.0} ]
                }
            }
        },
    },
    '多田良': {
        '簡單': {
            'stamina': 50,
            'drops': {
                '一般掉落': {
                    'rolls': 4,
                    'pool': [
                        {'item': '界限晶幣', 'quantity': 1, 'prob': 0.15}, {'item': '3階進階結晶', 'quantity': 1, 'prob': 0.05},
                        {'item': '赤紅結晶', 'quantity': 10, 'prob': 0.05}, {'item': '細胞', 'quantity': 1, 'prob': 0.06},
                        {'item': '5階進化石-力', 'quantity': 1, 'prob': 0.10}, {'item': '5階進化石-技', 'quantity': 1, 'prob': 0.10},
                        {'item': '5階進化石-速', 'quantity': 1, 'prob': 0.10}, {'item': '4階進化石-力', 'quantity': 1, 'prob': 0.13},
                        {'item': '4階進化石-技', 'quantity': 1, 'prob': 0.13}, {'item': '4階進化石-速', 'quantity': 1, 'prob': 0.13}
                    ]
                },
                '部位掉落': {
                    'rolls': 1,
                    'pool': [
                        {'item': '界限晶幣', 'quantity': 1, 'prob': 1.0},
                        {'item': '赤紅結晶', 'quantity': 1, 'prob': 1.0}
                    ]
                }
            }
        },
        '普通': {
            'stamina': 55,
            'drops': {
                '一般掉落': {
                    'rolls': 5,
                    'pool': [
                        {'item': '界限晶幣', 'quantity': 1, 'prob': 0.18}, {'item': '3階進階結晶', 'quantity': 1, 'prob': 0.05},
                        {'item': '赤紅結晶', 'quantity': 12, 'prob': 0.05}, {'item': '細胞', 'quantity': 1, 'prob': 0.06},
                        {'item': '5階進化石-力', 'quantity': 1, 'prob': 0.10}, {'item': '5階進化石-技', 'quantity': 1, 'prob': 0.10},
                        {'item': '5階進化石-速', 'quantity': 1, 'prob': 0.10}, {'item': '4階進化石-力', 'quantity': 1, 'prob': 0.12},
                        {'item': '4階進化石-技', 'quantity': 1, 'prob': 0.12}, {'item': '4階進化石-速', 'quantity': 1, 'prob': 0.12}
                    ]
                },
                '部位掉落': {
                    'rolls': 1,
                    'pool': [
                        {'item': '界限晶幣', 'quantity': 1, 'prob': 1.0},
                        {'item': '赤紅結晶', 'quantity': 1, 'prob': 1.0}
                    ]
                }
            }
        },
        '困難': {
            'stamina': 60,
            'drops': {
                '一般掉落': {
                    'rolls': 6,
                    'pool': [
                        {'item': '界限晶幣', 'quantity': 1, 'prob': 0.18}, {'item': '3階進階結晶', 'quantity': 2, 'prob': 0.05},
                        {'item': '赤紅結晶', 'quantity': 15, 'prob': 0.05}, {'item': '細胞', 'quantity': 1, 'prob': 0.06},
                        {'item': '5階進化石-力', 'quantity': 1, 'prob': 0.11}, {'item': '5階進化石-技', 'quantity': 1, 'prob': 0.11},
                        {'item': '5階進化石-速', 'quantity': 1, 'prob': 0.11}, {'item': '4階進化石-力', 'quantity': 1, 'prob': 0.11},
                        {'item': '4階進化石-技', 'quantity': 1, 'prob': 0.11}, {'item': '4階進化石-速', 'quantity': 1, 'prob': 0.11}
                    ]
                },
                '部位掉落': {
                    'rolls': 1,
                    'pool': [
                        {'item': '界限晶幣', 'quantity': 2, 'prob': 1.0},
                        {'item': '赤紅結晶', 'quantity': 2, 'prob': 1.0}
                    ]
                }
            }
        },
        '深淵': {
            'stamina': 70,
            'drops': {
                '一般掉落': {
                    'rolls': 7,
                    'pool': [
                        {'item': '界限晶幣', 'quantity': 2, 'prob': 0.09}, {'item': '界限晶幣', 'quantity': 1, 'prob': 0.09},
                        {'item': '3階進階結晶', 'quantity': 3, 'prob': 0.05}, {'item': '赤紅結晶', 'quantity': 15, 'prob': 0.05},
                        {'item': '細胞', 'quantity': 1, 'prob': 0.06}, {'item': '5階進化石-力', 'quantity': 1, 'prob': 0.11},
                        {'item': '5階進化石-技', 'quantity': 1, 'prob': 0.11}, {'item': '5階進化石-速', 'quantity': 1, 'prob': 0.11},
                        {'item': '4階進化石-力', 'quantity': 1, 'prob': 0.11}, {'item': '4階進化石-技', 'quantity': 1, 'prob': 0.11},
                        {'item': '4階進化石-速', 'quantity': 1, 'prob': 0.11}
                    ]
                },
                '部位掉落': {
                    'rolls': 1,
                    'pool': [
                        {'item': '界限晶幣', 'quantity': 2, 'prob': 1.0},
                        {'item': '赤紅結晶', 'quantity': 4, 'prob': 1.0}
                    ]
                }
            }
        },
    }
}

def calculate_ev_per_stamina():
    """
    計算每個關卡中，每種道具的期望掉落數量，並換算成每體力期望值（體力效率）。
    期望值(EV) = 掉落數量 * 掉落機率
    """
    all_items_efficiency = defaultdict(dict)
    for boss, difficulties in GAME_DATA.items():
        for difficulty, details in difficulties.items():
            stamina_cost = details['stamina']
            stage_name = f"{boss}-{difficulty}"
            stage_total_ev = defaultdict(float)
            for drop_type, drop_data in details['drops'].items():
                rolls = drop_data['rolls']
                pool = drop_data['pool']
                
                # 【注意】此處的計算邏輯對於組合包和普通掉落都適用，無需更改
                # 因為期望值是線性的，(A+B)的期望值 = A的期望值 + B的期望值
                for item_drop in pool:
                    item_name = item_drop['item']
                    quantity = item_drop['quantity']
                    prob = item_drop['prob']
                    ev = quantity * prob
                    stage_total_ev[item_name] += ev * rolls
            for item_name, total_ev in stage_total_ev.items():
                efficiency = total_ev / stamina_cost
                all_items_efficiency[item_name][stage_name] = efficiency
    return all_items_efficiency

def find_best_stage(all_items_efficiency):
    """
    從計算好的體力效率中，為每種道具找出效率最高的關卡。
    """
    best_stages = {}
    for item_name, stages in all_items_efficiency.items():
        if not stages:
            continue
        best_stage = max(stages, key=stages.get)
        best_stages[item_name] = (best_stage, stages[best_stage])
    return best_stages

def simulate_runs(boss, difficulty, num_runs):
    """
    根據指定的關卡和次數進行模擬掉落。
    """
    if boss not in GAME_DATA or difficulty not in GAME_DATA[boss]:
        print("錯誤：找不到指定的關卡。請檢查輸入是否正確。")
        return None, 0
    stage_data = GAME_DATA[boss][difficulty]
    stamina_cost = stage_data['stamina']
    total_stamina_spent = stamina_cost * num_runs
    total_loot = defaultdict(int)
    print(f"\n--- 正在模擬【{boss}-{difficulty}】共 {num_runs} 次 ---")
    for _ in range(num_runs):
        for drop_type, drop_data in stage_data['drops'].items():
            rolls = drop_data['rolls']
            pool = drop_data['pool']
            population = pool
            weights = [d['prob'] for d in pool]

            # 【*** 此處為本次修改的核心 ***】
            # 檢查是否為組合包 (總機率 > 1.01)
            if sum(weights) > 1.01:
                # 如果是組合包，直接給予所有物品
                for _ in range(rolls): # 處理掉落份數
                    for item_drop in pool:
                        total_loot[item_drop['item']] += item_drop['quantity']
            else:
                # 否則，使用原始的機率抽獎邏輯
                try:
                    results = random.choices(population, weights=weights, k=rolls)
                    for choice in results:
                        total_loot[choice['item']] += choice['quantity']
                except ValueError as e:
                    # 處理機率總和不為100%的容錯
                    if "total of weights must be greater than zero" in str(e):
                        # 如果池子是空的或所有機率都是0，就跳過
                        pass
                    else:
                        print(f"錯誤: 在模擬 {boss}-{difficulty} 的 {drop_type} 時發生錯誤: {e}")
                        return None, 0
                        
    return total_loot, total_stamina_spent

def main():
    """
    主函數，整合所有功能並提供用戶交互界面。
    """
    print("="*50)
    print("歡迎使用討伐戰收益分析與模擬器")
    print("="*50)

    # --- 第一部分：理論最佳解分析 ---
    print("\n【第一部分：理論最佳收益分析】")
    print("正在計算所有道具在各個關卡的「每體力期望掉落數」...")
    all_efficiency = calculate_ev_per_stamina()
    best_stages = find_best_stage(all_efficiency)
    print("\n--- 各道具體力效率最高的關卡如下 ---")
    
    # 自定義排序，讓結果更清晰
    def sort_key(item_name):
        priority = {
            '強化石': 1, '稀有強化石': 1, '精良強化石': 1,
            '2階進化石': 2, '3階進化石': 2, '4階進化石': 2, '5階進化石': 2,
            '3階進階結晶': 3, '赤紅結晶': 3, '界限晶幣': 3,
            '細胞': 4,
            '戰鬥秘典': 5,
            '黃金兔寶寶': 6
        }
        base_name = ''.join(filter(lambda c: not c.isdigit() and c not in ['-', '力', '技', '速', '階', '進', '晶'], item_name))
        tier_match = re.search(r'(\d+)階', item_name)
        tier = int(tier_match.group(1)) if tier_match else 0
        stone_type = 0
        if '精良' in item_name: stone_type = 3
        elif '稀有' in item_name: stone_type = 2
        elif '強化石' in item_name: stone_type = 1
        return (priority.get(base_name, 99), stone_type, tier, item_name)

    sorted_items = sorted(best_stages.keys(), key=sort_key)
    for item in sorted_items:
        stage, efficiency = best_stages[item]
        print(f"道具【{item:<12}】: 推薦關卡【{stage:<12}】 (理論效率: {efficiency:.4f} 個/體力)")

    # --- 第二部分：手動模擬器 ---
    print("\n\n【第二部分：手動模擬器】")
    print("你可以自行輸入關卡、體力或次數來進行模擬。")
    print("輸入 'exit' 來結束程式。")

    while True:
        print("-"*50)
        boss_choice = input("請輸入要模擬的副本 (壁虎, 獨眼梟, 百足, 野呂, 多田良): ").strip()
        if boss_choice.lower() == 'exit': break
        if boss_choice not in GAME_DATA:
            print("輸入的副本不存在，請重新輸入。")
            continue
        difficulty_choice = input(f"請輸入【{boss_choice}】的難度 (簡單, 普通, 困難, 深淵): ").strip()
        if difficulty_choice.lower() == 'exit': break
        if difficulty_choice not in GAME_DATA[boss_choice]:
            print("輸入的難度不存在，請重新輸入。")
            continue
        sim_mode = input("請選擇模擬方式 (1: 輸入次數, 2: 輸入體力): ").strip()
        if sim_mode.lower() == 'exit': break
        num_runs = 0
        if sim_mode == '1':
            try:
                runs_input = input("請輸入模擬次數: ").strip()
                if runs_input.lower() == 'exit': break
                num_runs = int(runs_input)
            except ValueError:
                print("無效輸入，請輸入一個數字。")
                continue
        elif sim_mode == '2':
            try:
                stamina_input = input("請輸入總體力: ").strip()
                if stamina_input.lower() == 'exit': break
                total_stamina = int(stamina_input)
                stamina_cost = GAME_DATA[boss_choice][difficulty_choice]['stamina']
                num_runs = total_stamina // stamina_cost
                if num_runs == 0:
                    print(f"體力不足以挑戰一次【{boss_choice}-{difficulty_choice}】（需要 {stamina_cost} 體力）。")
                    continue
            except ValueError:
                print("無效輸入，請輸入一個數字。")
                continue
        else:
            print("無效的模式選擇。")
            continue

        if num_runs > 0:
            loot, stamina_spent = simulate_runs(boss_choice, difficulty_choice, num_runs)
            if loot is not None:
                print(f"--- 模擬結束 ---")
                print(f"總共挑戰 {num_runs} 次，消耗體力: {stamina_spent}")
                print("掉落物總計:")
                if not loot:
                    print("運氣不佳，沒有獲得任何道具。")
                else:
                    sorted_loot = sorted(loot.items(), key=lambda x: sort_key(x[0]))
                    for item, quantity in sorted_loot:
                        sim_efficiency = quantity / stamina_spent if stamina_spent > 0 else 0
                        print(f"  - {item:<15}: {quantity:<5} 個 (實際效率: {sim_efficiency:.4f} 個/體力)")

# 程式執行入口
if __name__ == "__main__":
    main()