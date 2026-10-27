import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Blob "mo:core/Blob";
import Nat8 "mo:core/Nat8";
import Nat32 "mo:core/Nat32";
import Nat64 "mo:core/Nat64";
import List "mo:core/List";
import Array "mo:core/Array";
import CertifiedData "mo:core/CertifiedData";
import Account "../types/account";
import Common "../types/common";
import Icrc "../types/icrc";
import Token "../types/token";

module {
  public type Account = Account.Account;
  public type Subaccount = Common.Subaccount;
  public type Timestamp = Common.Timestamp;
  public type Value = Common.Value;
  public type LedgerState = Token.LedgerState;
  public type Transaction = Token.Transaction;
  public type Approval = Token.Approval;
  public type DedupEntry = Token.DedupEntry;
  public type FeeCollectorInfo = Token.FeeCollectorInfo;
  public type LegacyBlockInfo = Token.LegacyBlockInfo;
  public type HolderBalance = Token.HolderBalance;
  public type DeliveryResult = Token.DeliveryResult;

  public type Ledger = {
    balances : Map.Map<Account, Nat>;
    approvals : Map.Map<Account, Map.Map<Account, Approval>>;
    blocks : Map.Map<Nat, Value>;
    state : LedgerState;
    // Deduplication index: hash of (block type, tx) -> block index.
    dedup : Map.Map<Blob, Nat>;
    // The same entries keyed by block index (ledger-time order) for pruning.
    dedupQueue : Map.Map<Nat, DedupEntry>;
  };

  // Token constants.
  let TOKEN_NAME = "The Ten Thousand Immortals";
  let TOKEN_SYMBOL = "TTTI-T";
  let TOKEN_DECIMALS : Nat8 = 8;
  let TOKEN_MAX_SUPPLY : Nat = 100_000_000; // 1 TTTI-T at 8 decimals
  // Token logo (256x256 PNG) for icrc1:logo.
  let TOKEN_LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEABAMAAACuXLVVAAAAMFBMVEUBAQENDAwjIyYXFhdhYF4xMTFubWpBQT9SUU+bmZSOjIdKBQt/fXnb2dKsqqTFwrzGO6KTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAgAElEQVR42r29e3RT55kv/G4JYXeS1bW3hTHTZPXIW5btMD5TSRtjhvBluAhZpi6RZWQZyrTBCPmyXOKbLJuhqTG2LGcI7clwk5YxU2IbpOVAKdPpnOWz1jcBY2x9CvyTb76SVeGes1ISc8Cs6emkISu2v9/zbtlcQy5Nu5MFNmC9z/tcfs/1fTdjX+4RrJ4ue308Fo3EYsM+h98osj/jI+R1xaNhPNFwLByjr2LDQw7Xn4uGzJaJ6enp/qmpMO0+BgIisWg0HI0NF5f/GZYvOhAN909PhYe9jh6/2y3LJnegLWSrJ1oiwzV/ahIyS/uJ9WMOv3z/YwQdbV11sVgkXlP2J1xe23pmejo8jNWtsun+1flvVlMb+BDtKzb/qdZfNTEdnurrcakLmtyetlCoy+YIhQKQhJWT4imNR6J9+/8029/bPz3dV6wuDxtMQBT94X5uDZFhL+giGuTKumj/VPWfgAmaWij+uIsWAauj0+HI9PRUfyQai4GAKWjG8FiPi6RhCkanwkNlfwL2T/d10xbzglGwYio85rM5egL0hGy+BJERGXMQCUpeXTj8VYshB2Y/7pJdRlNbFKtHxkJ+Veyq+smyu80eBxHDNeCRUQ4CG9Z/letX9IdvFpPit14Z64+MFbvlxzymttJwJOorBhOslRPh8K6vbv3t/f2c/fm10zftvu6FFd0ekoD/HjkeuIfwWBMJqi4SvfxVYfP2cP8R+tDW/tmpgRQCgeX19f3YcT/h8ZitJ0WFJxgPR6qJuk2R8OWviP+x8ACMz1RyZ26qmluhqaWOVD/aD/CNDXN3EB7ypQBiC9BiAPQWHgh/NRTkRqK0ft7uO3PgA/QgrytxJTw1nIgnEl4bf+y++vpEOJZwYF2XbCo9038EP2E9EAlf+uPXXxGOjRO+TExPjdPH5wXjsVjC54snfKnl+dPj8tjJGXEJtUSnyBqs4MGGP3b9ZdHoQDn42j99cyO2bwpe6aOV7dE+Wt5uo1/5V45sVtgyESaodMn58TFvkyJbX41E9v1x6+smYuC/sSI8fYvUsLJ2emoU69VFxhZWt9NX+M/bzFhGSzQ8BCsxmg4MDW+0kib2Of8o/N8UGyqXjTlnplNmMDVk8znaopEU92l1/oTol07y1wf6p8hfmFqjfd1WubA2fOSP8Qt7In1NsjF/ov+QC+zf1H9zNGTrXDXB2e9VV/d6iRGOQFuXSgHLn+BGY90biYEHeRPRU19+/ZWR2HqrMd83QWqYXxftq+lyOLPO9NlSgue/YvM+kNLtbrP5OAWaA+GhJqhgMBrptMr50WjVl10/LRq9hD3EfTVA15zocGy0q8ecdmZIXdibEkCP24OowObF7132Rh6z5kRJYta94b5O6E8k0vElY9+S2GmjXFgXAbobK+sjE322blE3MWpLcX7+cSA0RFxoK3aDCQbVdybGugkIYoQHr8a+pBoURPrKYUnRQ1g/Pz5eF/Z2Ms2m0QX+2/H4fGC/1+F3wS+EQn63p1vF/0w7UYC1B6CPtbEvhUfpMVKAin5Sw8r46S0Rb7eoDXodIRtx3utDOBBKxQNdKhc8oR63OxWJaILDoKCwLnwZ2hOLfQkhCLWxy1ZjTiTSCfCNjxp6x/2i0OrtaePQC7V3KeK9NMkdCLhJEKAjxW7NgUQnGUFko2zcHvkSQiiIDBnloonYeqxfP2RYNOA3sy01TXnYO3A3+5F/LylWN394ZiCITPMq0Z4TjTTJ1k2xC1/YAmKx/bK1JEymXDfkZAe6DWyZw5Vnh8CzP41pioko4HooAUVtFBnsDR8xgoWxhi9IQC8JYHsYCli4qW8DS0PWpemR8+wPZICCXna7XffnpfwPOIaC58/0DsEISvov4ZNix77Y+ksjgOCi6M1mWT4Q22VmFU2M5cmeUNP8YkIhgkAEp9NTsTFbKOCyLJBgUlkADdFuiZ6GAKNTEGNddMcX8gET0SqrddOZS6RAQy6m7TEzDXaTUiWtp/TMnbnZqcjwmAoHdi/swLjABVCpH/kZY/KB8C5ZrgjfgC7Ehr+IHq6JnJaNBREYcX50YtDA0huZ4J5ndWEQq09Hxu4PB/CQbqr/QjAz7cjIeTjHnFJgodwbvkSQcPILJCHRWDMEAAQw1YanwHY/Y1aVyUJ+3fTcLHnj+cfr9c37RK+jKbXNkZGRX4CMvP2bjrhMsMUmOS8WM3xuArbFTlmNvcS+PZGrvzcyjYHsan756dTygCJ6ulRo9Krw6OBa8hQI0MMe5c606GXZlRs+JsvbY4OfOwqJRMrlFeFDsitnuuosJCDM1wbqUBlQYwFKi/wuRUqxBT6pLcRJsRUDC58HASJUobCNrQyvN8mbwutl00T085riVpJZbaxTNp15L22ue0HxKxNIAH0qr+eLQrA7pGZQwk6R6kYUmBSfF7H+CCs0MN0Ws7akz+XKn4A5bI8c/bwM6JPlAoC4sf1uw9c+dqX+2Fppc9h5+OdVtU1POQBZIp5Rn08lFP/q2yPdWP8czAaG2CDkRU/J8rYhmOLnZUF79AL41eeSV/WfZD/6oCxVm0g4bPgv1OWrKRepUFTXf2d2atg3H5I5ulKFCb17xEESgBGYWd46Jm8n/teNuuTcz8cCzoDtJIXdcCFXB/nH6koi/YewfKCLtEzI28R1Ea7RobpELv/50shI5T+M/Jz4ASVYzzLl2kPg6JGNJrn2c7Fga6xKNkXBgOV314ua6W41OY8iDggFPF3dZiaYDvRzGOiywf+6ZAUP8kQoYbFqaJIAn6BiQqafaeCOq2S5Pt4k54YPfw4MiIEB28Ig4spRmS36kMy/4s7NMThgjycA0yrq8tXjO9sjPlGyegLzaKcHBfS1xsO0MGbwPz86CC0IfzYWLA9fkAujR0DETVc5W41IQmifmwXe+90E+IXBiSHImyweBSI7t0ajtOCdFlwCs6oUFJlBgKkUYcmBYRcke/KzvUCk3EgMyDszKGczGR/aOzc7EOrhTk9biZSElrdD/+/Mzc0CFmIJqhg+WqrVm4gCwSwgb84NN7ny6wZNpmjkszzC0vAgTAAM+N4nLpnzq53WVxcoDMZRn8Tu68+QK0pADxwq/Njvc0YLvppTwBjyWevEKfIGLte28FufQUAJvABnwJVBE3d+rSdmh3p4DKKttPu8FBHaE7F4zGd76LHbeu4nQTjHtCoF8l+NnM+NNLlysLe82JHPiEQjR60yGGBshwuVySbu9g/0+Em0mV31FJFipfp7viDEny7VJzhC/nkdENgzWBsUgHFWoMLPNwEKd9+SXe3RJ8enW6MbILALctGZCyaSQMHc3dEA30ceAXAXj4dV7xPyu4yS6qIEvZUQOQRIAEhpmSDplXNco0z4/hkiICfWJBcgMsl/MhhpYth8SZ9s3HaLMyD9ztzpAO1CqFxwfHbV9Vse00Iw+QOgVhDIF53ntGXAJ5Br/LlcAi2YQIBR8kSv/Cw2v4rUEGgsww2fnb7FcV/bshB9eLt8Nr/lU9sYpoA/m7Y8oudIJIz8okElACxwbYeDK4hcfAIBtbFyYzt88TbSgGz213OoNyysDwEgIStu85sXkEemOhmqZPcZod70XVp/RMzgVjjyi5BKgLybrPCUbIo/QQ3ToIKFUajhFTAAKvDinWO0voaLvtsEArqKU7xXXa8XxRLkSDwi5DTACXKZjyAkzKCflfJayvAdTLEg4pL3JJrkPU9Qw+XR/caC8H64LVRFQMDVO1WkywQ8jrLMINDYraIvGka2B+wQbspltGDDI/MEgJJCoiCrreH5EZmqO7UX4BUuyas+PTISJo5YjbWHrMaSQZlz4Opdp7q+rduss9f4U3FpYZvtgYCUx2ZA5p4mhQgYmSdAICtM63ICjF0IqUmuJYC4uk+NjxeFT0IFYYPD5TLXgas7Sf749CamszvcKvfvLV+PGjVcMlcCRZHoAQHCAgFMi0xR12XQoGyFCkteuMpVgNigILr2U0OxZlJB4/bLvPtgZIHU+s1Yv9jNlS+jLYV79ShNR4aKXdKDTPwZtzqVgGfOFZqKdQFRYwIF+L/3A6jgUaDhp0CBNnrICtBWrHFkhVYyQ3xgK3bbyHTBYp72CnmpvScmwsMJFQl7wAHjfXapqgCUEKyQ5IqajQhJ+PqunKkm1x4EGiUx86dI4IK8IrpByRlKlZ4pRx6l/WuwPilUJkei+rF4dLjey2G4y0G/UqFm3h+m1kdIBlb8TCPXnmSFWN5EPabdg3JOBDIIr/0UGG42vjqkKAcuwASo6s/Ykls2236+fvk8GtbH0J6hOoD64JNRHQnw5hHhsDCyYARaYkNhzussAyZA67u2vYdo+7RserwMBJJA9IK10FfOO2FWQsLTKL1pW/n6Go5G8Id+Xql3u02pjhkkjOqImzonBJvzDCARwDG4axAem7gZIEvvlLfBxHsfKwNIwLpyuNmYU62orRAg4exosSi01JD1F3I0Qk3MTYtD7aV76CegOmFCdEi4+FcpDcBf68kSrEGDltjEKe09Cm904VNk8FwMEhhQrKX7rQp1Y6zZ7Ox0NZVFKBrISy1v8rihco/rREgKr+TT7jltenWX2ooOwcSBCL/mwseVHIMdPC44nTiESOCkdcURIwgwKrKSzU7MOtkqWl8Vfw8JXbZ8eh8EBYvvjvzcVK6apprOCjlrBQIitZkQXS9vBxyX9ImP8QMnYQP7jdtPWRFmkxUCiA4znddfjliIon7/Q9WQh1fnOx45LyMCOqdSwHE7DwS41EarSd5zGYpQJS8PP+oPnqXFh6xy6X5Z4X0wKGEp6nLdLqYh8KHlH/LCkp6URbGoG37mZ9z9olIEKRjvUbCqQcsVlYNBDkJjyCA/8sajRaFhJA+XrEWjRsVoNBIJRmZhFdVuMbNN5f59ywsZYhZ3R/VjMItmrVlj0I/wvFzV/hHVawhQZJYvUm2FcwC/11bJ24BFtYcegcHYUeuqxH5jxS5ogAI1ABYiRj4UMGSFqATqvsd8ramlPtqwaAz5ST1K5jWd+pC4xPjdX2hSoQ4RYJ2nAB4SuRHhkIuT0Q47QNjX/kiGsii807htyGjctN9ohRJwJGLCle6yJaM9gVSawz/d1IUWeSy+Q5OI3plLTk8PI1C9hBLKM84tnh71nz0DHVDUIEULCkCAKgAyhBzYwcQg4s6XHg4FEAuVHLUWJYy0umIEB8zsb466VtzqeWD7S+KxRDwa7f+Q1Z1I0vOxo8u3TutUhLTOUNDXQAVCgZRCa+U/lCGXMdUMiQi0+Cc6Xe1HZFP49YfzgSPWvGiVnHtZIQUACbIsCidCoaluSD+VA2a0XGZaeME7M1jYsDXGKbiLhN2ZbhvX9uQHHA7GLB5i7nmKmWj3grEFmQHnvsllBEfaafswxCMPh8OD8sqYy9hKjtAIPSQJPP37if5L8jz7NS3Y/D62ki87k/zJokiUvroW8nnF7YlRm9tfautggq4m28ILpRQegnJtQQOzmlzASSOqVkG54Aa2fwGI7HxIBTYY9xySC72k/woRABj4fnTuqJxiv1BZD96Hj4ias1j1zonkr7Sx2Ex/MvluV2KXMDFWX+Wu6PGKgnBgn8bMUhLTgnfCin+DHMhaEZ5dmevMo+0fk3MeUoLlMZdcNyivGEerBQqo8JDwx3MfutyqRWcGYwnIPjl7ga2BAD5OzCSdW2PHp/Bl11jDotmxcU9+dcUOZqm4rGtATUtQCzta8LFoPiEW9iKd/a28Gdvvg0d8ME8uOWQtim0wVlSBA+ABOTkz+9Fdv1r7ZnunEonEcDx2PHm3QXsVfK84nvyPxTfPToKA4Kj4w4/H/H5b26hYtCXR0CaS6HObORe0eeXWTjVcb7kyNzczCxig7Xc+pASkAgUAqdL9Rj6SQopoYN8aNKnrS7c/SSQwKxE7MZP8vbgaMqh6O3lNiJISfGKv0s7FNjYtqa5bp4nHByo69LTcyp0q6zQBVxkr9HTFobmTc0camWnFLeQ9J6EE9yNBOlCgfcCaBzTkYwmEA9ksLVVnYcrMrcTwmanh2Im55OQF7dvJ5Dt/k0z+09YYpHHD1/D1a6cr5dLEgLh9OJHoKTQjLDm36A1ravAHdf7vz+GZvcUrOBlytJOUYMUDLnk1NIPg4RgnAFDAcUjLw1BI1DJzKx47038z3j85k5ztWIyNr7+d/HV65DYIqBHfvNmz69VEuGMF1h//xQZU6p86V/A6yuXcFkwiW31ntn9udpRHTX65V1WC8P3uoPcIguad8p5L3GfCCkACWMjXByJLM7HLeVcit2enCAGuGX4M5X8lmVwbP56c/LBq8eShA7747dfToKeJU5Vw4yjsHjwsmVnmPH5mhjDUEZ2eGvLZiuXlx0w52HDt/R2EiaNy7lS5XNfJCYAlAAxklf2aciZoJgdEtixyJTnHwe/fhZcBQMnkr7aeTU7e6PjhJPRz5n1d3fBAaXy4M2CiH3z2fREV/nsVC8HUFlIjalfOTShBldx+X0ygAzJ874a1aNjFVQBWACBMwW9mGdPq7q6jPu7wcVoeRHxEFODZ25+cO2KcmYwOH39fe2U4Me4b+OeuQCO5TWHcTE7gwaIRIjYAkglKUHsKcdk9KFoc7jRufl9eeXp+NgsCmA98Cp1MSPuQvtHF4iSB63eSyd8KB4mAo+GZ2WNPJydj4UHh5chwwl5/9H9Ub8zkP1kEjdM+bsJPI5dUyQC9VfdB0WpEqqgIbLs0P4yipJYvFJkJxfL037FCVGxXqug/DTIusl5w4g9XZq4PvpC8Ht3FfvxuPDZ+YCIy2iWjfbuq26k1EByZmevRsG0bBB5zmaL3tLD9iHVVeL+xZH1KBYy8JuJnAv5HQiQs+qciuxcsfTUOtU9O9s8kr20Q9sAOds9MvvGj5PWj7K+TffHL5+v6w951HvAq7hgXyYMBzfIND7T2MP4i57yHRtJ+2OJ9OmhdGQFJTaoAaP1lZ8abmBb/cwJcPpsdY0Fp9WeIBbNTc3O3nJqJ5LVXb09evAp0TEteiw2M/Gt4OrKLWP/qmG3UqRAH0etrZgoPz8xq/E5hAbY/ceE+LdSQdzoi5/elBAAg2X5n3I2UrIlp3PgusxR5mA/DGLmJ29wFY57mFNt2+/reO9c3nk1+wF5L3op+e+S/n5iKdGOOYsUQCheyDAApzGbpftUatYGUQkgZci22fxQVC+cCDm5AMAIYsqbW1+yeu+xB+0eDHwZHhac/5PUZuFN7LdnBJFpm0Yb045PBE9ccx6/t0yVhiSMjm+fCw8X46XofqiYuiiEzy1laD9PxpTWBNrW2JMjt2PCh+7Dw2XC5PHHBuO0kX9/MdFcnxwPU+8nsZoWolgtfv+GlwjCmw5Z530wme5JzM3M3Xxd2T/quXEu8+Qfxb5Pv1sdGfnn77pEubGr7mKM8WN/pwZdYWhcSNapLy3B32dQx0ALsNgIs/Ol8VtonF5EOblATMt3ZyYFQM8eAKmbCHI7wjRu+kAOtehhEa8vt5EszkzOTd4fF5TPe3dfqjl9kx5OfJGLu3ZPhbtCYNtptsbb6qkn7NH6zpsusTbVzTe4WHz2unBtyPhzixOF7vngFGSLpIDLSq3NHQqoLXbUDaQWktuaWrVs2dflIDy9vv/2TtyeBweGO9NvVm9+tu7NvUTI5lBhon7k7WImFgj1lFD6N8eJ2t0ELphS63TxGRlOBD7vkQePPVBl735svDR21FhyRi/pUARycHQqlGlXb1wr5SGHSMurXc8NEzMkqml/96L8mTbDEC9qrg698XPex4VvJ6331E7eTN4hdy4otajDEzLAfOMBWxGmphrJAY6A233q5Flg4KG+NiPNGYGw/Zl1BOpjNFqM27kg5kZIO7RYn0y5xql1Dll+DfLtGd+Xt5EtvJydPs1cGX/ik94b4JjzCmbnk9X09+OvQvN2nleGrUDnbAsDTuCmyEogCjDl0Gw9Wyb3HAMaGe0YwqBRgYAWR8NmYo6sx9RnhBs0W6OSKhenIfNrivpyzyXdgju+Z11z62u+3HtUBmwiZTy4jDFyY5dxCSfUWF6ukAn2hi0Jridp8siLJ2wbJ7nP6O1KeoJkbQRUx4C/ftYU2qvGcqLnlLERQnZXTs1BPIM0KWlq5VxpoSB9c/MFzbyA8uA56PszAz2kW1k8bIAJy/CznpNo0MJkXGipywTEyg7z+f0t5ArkQTNi0H1Uh4fgHPcREgIiJpR8zmIrhVlodzQugCVmmrde8Sl6pplw3uOjoCy/9BfeM1xuIuHvub9vlALi+pNu86hT2Ahyi8D7VgrXmA/YQEpz5x3ueoFxOlCOU+Mvr1W2dfAAis4ktPip6oPj5pUc898ZFKN10ZpE7HijXDqYPfm3tN2j9yYtpG4hrCwTs3e+icnuxYdkQ01KFB+V9kbfUgEQA47z+Knn3+6qqHdOv7FMKRxWryN78pKeNGCAKnib29FGhEqXK/E1TPfc8CjahDYk5t5PXHeXCxbQLi9cuAv8nD2tDZsbu876tDbIbSFTckB6DFWRTxbmbYpxVtng14r8m+cpJ+eAN1RUdVgoO6VedVoxs8eR4GzUKLSwr0Mm+fljTAhioLAmPP5jLpnUKFf2HOpuEtekX0zrS9iJEEbc8OLcntDitMH5t8f60KyLjWZq2rRtWLrTUzg7KcLybD8tbb/IENnZR8VxWVlyCv/rO3eI2Kg+bBU9gPfsvh3WtsPzA7punH0qmt+zD5E4GctJFG4QGTePeIWfWxofS/RZDJnURHd26swYkKFTcEDzU59C27P53K7xB+wfW5VMGPi+zztJySSm4oGdpM4cCPRSGgwHBtez7r2ftRTwUuPLxwENDgRqKDpZ1CGzJfmYWmkjCD5Go9Yu6AP6spU1zFcZWKPMuZ2HA77LoW0YpJnnuhpw73cBhoMGy+aJl2zqRfetajaeZT8AE2nxm9trJVUE4t8DZd0sf7vkuwVSVB0Tk0vhyZXmGp/nhwAuenDA5t0v/MiGRi3JjOCQPpg6AN0gACm7K+dMUlS2OZOvr91n2dIjC8feKKbm2Ml2brZqxH1xsQ76taztxfe8jo6GVrgCt2UKcT/N7mh4O/nQosLbhXyy1O1/8JxUHTKSDFB37eVCUO9WU109/tbrPktFTJgWd4tOTXr+bW1p+qw9x8JsXHeR+Wk8k2x6ZktbKZBmaUIh31LofaUQVNQosH9aX7us4+BvBwGdw1CqXFnAsIwfLn+5UgWDrKX2mzaL3WcSXpxw0i6YRtQGfD1K/U1UDK1y1906yavyR8FZLMs1qsxFsax6drao0FIrLoBxpvnXt/8E6iQVUSk3F+hpT3GXq3ylfISDoPSVl+SyZNVLaJ8MbyXFDBVvGavA3sz2jsMK89jvJ3/ge32uTFevjD5Vo26RuigagrlXbfsdaRcbbJhCD6ivl3fvlMxfkzR8QDl2SlhRL6Uelbw2PkgSggpUlPoxhamdbxqB8noMfvf27bY9tNAmf3v7yp78h6fyIYGy71vyBbQdIZPC2Cao16K3ojQc3yFdel9sJiQ7slHK69UsuiZtLqxGIMj26RBE7FtTc3TuGjfs3/9MP31n8KdNw2k85XJTv/OZFs2492WHNyt+zJTXUwjWhYGuiuBxxT/sF48GjQCLswrZPyl0vrVovYW7e7SQUXLbpCIyQ6T5uHwXr/BOHjl/XDTx2IV1pbOdjWRMw/3i9zAnI8eZ/wnS+9XzihldM+bP1dWP7B/JzUxDSULNYsUFasVOye90wbUigona0mtj464M1FNbFT9xINtQ/bvqjMO1m7KLmMaTp/Gx6fXP6RijnKl/lFBPsdhqtzTDx3glVTZcfVra+Zy2YcjLdaKPUukHKXadHXwrONkPU2sK+nZBv+ju7d1E0HTubSP7m2cfN5m7Jno685HnMX+Q1pl9rMhQVQ6JppT0nRFZhuwI4hxvkq1Mb86h1+S15RX8D7AQErJO2N2T4/J4ysoH0+pv2BpbBFr0TBf5oKof7Xp55RzP0iB0IhrSOlyOux8gAwPytfy8TMi43kpSKz5rZEq/9xHUnnBKVTKlou+IDK6BwxXQHkMKp72oU2xsya9yAQQQtuSU3vEhKUSa81cEJGDyTnDS0P6KGi/6grX65b9Na4REZ5FULt09LLP0SZcilNS9jm5iHP/4rgiMa0aYx6RvKiilXHnKTRd5sva9MKi3Lqna7eZ8juHsAKuBmf3HrRgM1HOprwjPJ/5be97AWPJd0XjkbCTv1D1tjZlvH1yYR4C/bSaHFgZoXO5gW/ZZNyQ5mmtfCvCPyqki5CUHZ0zWWzESjVJ+dtZESGMWs8Z7xAocRDtx8j9ie4xiKTH3nXbH3fkPQQlhFb/7H34WjEbFM4A70ngACXu3xd55usGRuJJzePvpjuJxWTIEd/5/UwSMtMMqmCAoEzXL/f2NrqiWdr0xfb1nWDRjUQgW8U1AB7X729fBpWnLFyara6W8mL6bfd2ADMRF+2fru1++Gb+icHOEX6tkad0nHj5LvxAU98lLeetwMl7PSbre9/P8hXTCpGbg1XE4pOpzBChAwlp0xZlnlRwSjV9iK0g9toqhrZP/lzCmgEks7mr/6+ETyXee28OVUdJwJo9SgbJzcMzn1/jLJoGZ+RrWtH2j/LSqJhz7KllaVU3C5dKjkN+SUir0lv2a8astrMBPY/gbjlcMsd6OU5rVkjEqryAhBQMXm96ACWQ3s+yd2MXyoNpHVjZrw5IBSGx7qKbcoptYYRLS9z5w2M3t96rcenciVIMODkB+DvXs/PoAY+YVTkoGCKz1bNFb6HzAG74agfQ4bQDBANQLj7mZreKey+zCrKJayHFLWaakInlDAhGLw6ihFok724+kNjFxN79ruXoThs6crcbpkzGafuLmPZS+KRS+iYnk9fHSjlpdhgJlokyimvTNhBMkf3W1SeJKUwdLHSn+HsMm+I9f2ZoeKh0RAyX5rvCp781G2ZT2AXFsAACAASURBVKO0zKFkHRMKUQvRWyyCfdqHf1fpZD+42yEQAQVH0/YeR2Vqtq8Obdv6xKgT4UjtrXifuBXlob5iUdctoOwgUjel68oMD9Jf/oPVsIqiOwQ3Y6V/AL63blhke/EnPKim6Tdj7wYF2VDvMbZ3l7SsWso6hbkn6DKMwPexHXCA4PzNTxq0FPWkDxn2xl6kj52KxUYRZ2levXBwZjIeXZuLHPlmyJzfVmbOym7zl0t5m/j6yd9PrysXQvt5mUs7tun3MJKVO9O8m37HdGraJxgP7jTuhj84xg5USSsuS8suSSZIwKKIuvoPyQO0icLtDw0aIkCwdeoG1MLgbBQdpOCJj3vx9c3o64sgghsBIVBZLmlq8nC87M6cSkDHFqs5i/bBCs3MvukTksROjdf2eyR2TSoB23ZaNp9U4I9fBQHj0pJBKY+MUBHTat/bRYEg08wcErN4Vr2qy1AQ4/Wx27Mo+aNVxXOxOzfSk7PhWy6d319kkbYPBGNUun2T/m7teqPQxY/bocp3oORjpjPrdjK7bZqbgz8Q6rZuu5B9cFDZdosFq6Scce2KC1IejFAP/Lw6AB0v6mFpyL/z1DnxUKcmfgWf+/9+ne9vMqk+d/PAgVvly/xN5X6pchPm6s4mf/MaWYy33Jyl5vimRrZ906yoMQgbWKvtKpiCY1kJb438yknLnkFl6xHWBQKqtSuqJBdJADDQT2UIz0a2aPISa1PLjFltzpXEgl//ZfKBp3jmevimMz/gz3O4PF11OAV9e+A6WPBxtUVoU4Xt6mQrS2fNyJo7Wa7tRYR4FRiG8zrkbReUg3DJfcxWJeVW61dekNDeURQ9y52yI38KbGBPX69ioVSd09MjlJxAp2pmfunZGKqVydMgYMrp9ri6/K7KkD0RjZxA8QalC7+Y4U9l0z1sie+OE+mpiy2xbf4JAnWvHQOZ8vaTCImU5TfZ+E6p4JJ+zUk9yvt6SWLbb3AdXMu+eW2dUN2UgteuhvT+yejC+ofKWBb1CmYmw1ON/kAehoozAkFfIn7lY+ph+DEyoIKm4ApB6mc7tEYYQpoXiACotxEB20AAktIYG7sobTulX3FRDwlI6EPvGSAdbGlg33q3QzdPAMstFvdEYmfVcn3yBoHvX88kb4GA/uaAv83MfaBvfMtE7E7yFuYKM1OZkuDqEtN8Z18SrIBLndcOM4Bn9nEClPZT1uVx5gMBl6U1IEBrkSSLUDJKOtjqZK994kyrni81a3yNmngiiuO12OEnMPBlGzS3k58QAfsCro2Mkp58u3dDbrCrGo0eIWCYD1qDBp336r8JyIsRanlvEijT2BNiMuMr71uXx9jABmnbLmn1G3qUkvV6s7aWdDAvaGZv3jAvWiCA5Y6bVw7jbC0IeBc1NOHgpOFNlYB1HlPHKmoHaeyhYsvKfeTAdJ0LUfMBp9b38k8Yqj8iC9rOoOTkxVSoQ36OCFCem2ID+6Rtg/o1FyWogKI36+qhgyzgZcLtQ2L6PQK0if3CJnQO0fuqphLo28nf/TDZl0yG+3d62srqLpErzOnKbxC4U8yZj980rmAHs+/+n0QA4Nh2pYE4EKLGzWHlFShhmA2BA4PSmp0SqYDenOZ1UF4zznRzR1latfveubNxcVEijj7ZeIDqHLeTkz9K1iWTUycu5rXlDg/xqTtbSOZVEm33QnDiDq5jwc3/h1lpGiHXVrsWOuBtc4ADvzW2g4Bh1rcTOqBfeREmYJH04iIv18FLLB0wkDZ+jwBt/T62KRHrvxUgA9/OezdA5PDtn+ZtqU/EN9Ket1/uXkVxSZbzHgGIx/eW/Ce8sKjADmt3wgpqKkM9XARHldXQgYvS9qPCmpNYXtLrxZU10MHM1p3s6cmdTHcfAWzNAFuaiEe8vGb3CkfE74EDt/9X4d5EInaK6nPpo7u2EAH3fkrntlez3E2/AgFmK9bedAlUFG/pzrZufV1pPyytDrMx4MApEKC36KGFYgU64MwEvn39+jqmqUl9FC+3xzt06MtRjmMWNnMCvgVEmvlP/YFEvNpP2iL4aoppVc4ADgSZbnsNoPAdlmE1Z4gAghqWa+9G7QapkfLKYQk6MLZBWn4KSKiHAOAKWum8nAep4beuocY7TwAvP249KdQl6r2IFw1a2wGY4/W/I7/wfmF94rQ+w03BS4VvF68wksi4Hmbmobm/yPdrhFqWDBFA4DMHbQApq3HrScvBkxJ0wLZeKqjWrxiEDtA8TBDhptaD6sBrH2MfDrcaagZ4SReuc8yHioTOqXX4KUjinu+3BYlEud3fROsu8tU0Mi2P39WmZWE+ivzpvrsAGZiYFif0/L4aAwRi3HrRePCkvmCUlVZJK+GOD2N90CB4iykXQTng7Q8NetaVIiBXrao7t/vGoODWDcyGEfsUMB/enti5fWNeI8Pkv8Zna0idh1F/srDC63OmeacJ5ZByIDT22TYihFaUbReNvSelgnFWsgvxgH7ZKaAg/tPUbBBY5hZkRsdvmE2sJUXAN/imvvdSgXdsP8r2H7AcMdO2WSXg9b2jq3axNIOWbj0IOlJHYrRq1ahwu88OKDwhahUiIIi5XEcD5KFY2ncqr+60bDvNXj0lrfBKaacEUIBwpIZqaq01TDvznhhgFX6VgMW8u/ONf1zqQ8lC1z5rRk12mSPBeXDywH4v9anTqVFQMV/X1qoQJh+we0WN96wB4a5ihoZ5vTg1aLEw8ysbqDa3/TQqNNolw1LaaaCQZBHTHZC8Gy26tJkPmIPldqufl84r3umH0331BlZ0dZLniZWB7xABGyu38/JJ0J8NqrrN6sSHqLaNZTvMUOu96hTw+YREXlwUolVAQ/s+Zfcb4p7TbM9l/ZJhS9ohAiLgkKqDVSjaHhO8bGmKAN1Ryn40h9J8YyJDnfgTJ0/B3GDBtX1beMa0zNeEKRVdsdpz1aZmOExDACLBvrlBIJxjK7zeagPSP6ZYehuUuh1SL7p/p6X0IUvmAIwQOLQCOqirRI3ua5NHNTCgFAHaoUKS7FjW2DjTtKNdw2cR8vdhnuQ9JUgKosXpFxRDtcXqOUxJQwGJKOQN+CA9++YOBpizUJa+UURkoG22lJQpdeskANPyASIAqRlRIOYAZvK2IDH427nBNBhQigAWN9HODhTWX2CZmCFJ7iLl0BSjR9mQVc27QZWYtkOG2qNP6QC1+0RtzjjV+4K1HQzBjgWpuL2Txu6KyqS6Mv1Eh7TpAls9JKX1lemHLSQDVgFx9lTgh344N4jKQdq8TpU0kz3scZfuIAkg8O+hUIV6OZoQF4c7vzgUAAEedXJD0FC7j2m3jUNBWbA0xYF0r70Z4//aQJkUt2TUdUj1O9k3hi2ZZzqkumzyRQyBiGZXK0pUP7hzYZGvIS11cIf1bsgHKcv9dR1CL+/h91BNV2trklvWqye+Kh22ygwtK5J500JJW8sJ2B6qxm+tdiJAIgK8ZTCYwrayjGEps94p1e9gTw9nZ0Q7LK86eURoF1n6rlYvYydOXFzp69DNdyq2XcwDHD+7vq5BoyZfl93EAkzaqTzSy21Bu6dQjxliLX2fvQqs1KJ92FrFdHAwa4kAiQhwIjLydEsaMN6XrU/sYItiTn18ndjeAay0CAhIV+4KAgZmz+6o8K3VznNg9aU8LPh0cb0hvZ/Dz695ZwXZNl9fa81rSvhCJr2osVhpZUMuFVcgH3QNl5hz4WLJzKGEwGH0ow0C7H6Zz6KJv0TVeqn2LfGVdYBiiwa1sNZqgoF3r+5o9e0Q5gn4xqki6PjT4w6xQB2imxzqua9Cr8iepcP1Ptlq1mRTkq91Vqi+qOeAk+Uacms2gAMKWUENYn6UQ6X0U8KSUSkNJ6LTwh1SyRvS1rcIi3U7mNZXDdNd9O9XdwQBB/MiWHwkE2XcxUeKWe/xd0tHMU/2Sc/CsSo6WOHcgt6yQzFqXOCUWWdu5daYtbFLZAecK2vWq1awgs6jaVCNRC4oLHVI6TgNrIvuEHsPS3/zBvmCdBDkc9h3sL/46Oo6O3rFoVRsk37D2B0Q02/1aCem/K2j/heT1+33WKAY3VpPT7nSWiZrTQAAc6bWphbtu4uxo4Yl1etVHcghGDA1IwNYelJac1kgAtAyEredEp6lkEhcZGArfQ5gxzdPX13v81azFk6Anun+9zl/0JB28xSOcLqUPHtP78zH4wv9TCWzu42AQUCG7sHYh9mqcaj1OjeOLPs6FmHCnROQb+8WaSRCkgreolWX4sSLEIVTPKZfchQOU1wislZfMXBotfflXT5fDdvCCaBDA+c8ezvSwkcXJbgfyO8Jztx1NKUO1+Gkner80vaboaxwBBydgAqeBsQIa9NrerAmXFAlTipgHEYriegQtSMWHsaP1R4Wnr2lhzOALyqk5LUYVpvuffEUzo6IK1PFwadGfr6qYIcu/PqaMVUrinomwtV8ykEv5nt7Uh0LYaMZlSataCjiZAqeSjNCMBDgwPQMOFBpK6ehFEkS0SEquSgtHyKMOSYsvWnJHAKLzApCCnsxXIHWtvn9f/X6DEs7+EF2nGItXpJ7AQT0zl8loPV0+Xo8LnQsshzdC+qYZwA+ZFiyeccaRTmEUkH72rQa5Bn4eNbmKMdUB76UNjmliR3inkO8cyul38zWx7P1kigibYAIEJlXbPpoBH2b9LU8JBVG/uWjZVtOacKH4/dOcAsev8vt8fTcP3CcmQ0OFCrGlpfUoBxjODZ7R1pNPa2KjK24DBULrK9PWAB/Yi/N+T/XJ+kIC8rwLzA05fVt9HmpkPHJiB0/+hJvJD818n+/UxQ6rQmfHnvyoc208rxylpfh3tuhBuVUJcaneFUCtG0bZRd9JWhGJV2sQaqjOOMbaNtF14kH90mUoePf/0MQzkjrnRoJ+tbpdnACnhn52jW/Y0gbHhp98pFJTTlmIN2Z7r1ceQth8Ut89g6wNUVAN9UCwYq00zDBbH3sLd43xPYvilt3EAcQutu+/c8+uLKWMyBgg4YI0Isj556e3Girl8KRz7hfR3CZygV/UeFetT4ToEgdBKALCb6LmhY/V0GMRgGHhsGEl/hY/T4zkGj1SdIS4ti3R7xwCem7wYldAnUDcHpHTJ+s8dUZouHPulPE42nWNpk8KhACBWBV9g6NjSMhCHCTBMDoNRfF1YfAhA4+QrJD3PqBdun7YBJl774NI0E7ZLD5/wkinluvEAEWpksO1Nc3nAl/1l1XRW3NmiaXx6YaCuXCY/YGjW0dxQOiJpSSAIeBo8AhJz9bclJafUSfdoOgCtmYfd3z/4KWDSv430GfgzVlqqPawsx79vqOK5HPIiAz0Khxy0VcUhqgwBL7kA8ENBABTNejSkAv7mkQS04Ka9QzV7UgJWLJiMAXMKdQHFyX9y8+AFn6B0G7zexfJjLOmrffLa1fu7uv8bOOTbsbM01KAT/Sl0EqsGmACHCi+qBnWd1uzoBsqc4gTQCMh9Ro55CUHnZKV5xYp5P1BDcsC/rIa0ZxqNdgWuQkGTD2XyeHE/+2+chnEaDxNBbKwmaeRxQiibHV2kgEZgHVD1bURCjENBbNsKQBDLx6Wm29oHsdXmc+uA5xc4h5Wjak2SlyYt8f9TkaCpfsIwJEtij5cfSNg33Nn8WBUIMpWweIRxSdh56cNxoEAQ7iogW+yUmbyZTSjgnpEadUp567exZfTrwlfe8N/F3QULilSocGD8KKp9+zOzoyl3U+9TOuHcevXTn6ymcT0NboMiw5yeETbm+Z90ZL0KnZBf8DX+QhFRCZLC2FFfZJmthbqcF2YOKg9OxhigkbdflV2pCdutjaG/aa/ZpVPc+bOQF/Oxl7r70v8Bl3jSmV5W7ztgYiAMf/WU7p+4EWpw5GgPRfqOwmFdCWS8svissPCWmxtamZ2rfErYf0YAsIaNLk7xICweImHJTpDdZ0a5f1jIiEYjDEj2/2RoJPRkJtecDv145yD5ZJw3clhwNtTh1PC0RtSzOXQDb5wt5TwqLUYXyyw2ehB8NUHvBn5+1iphbfRpxcfHrU2y0s+/Z57r4Ye+1afzRSt/bJEnAFAs2Lf0oxDI1Ua+wvV7krDSiZUOJJKQR2YsqWJpwAX2n1/Imv2mNaMoNaJwhoKjdVs8JKWzH2rRnw/b247LvzBDw9iZHN+E+eSMAKU6jN+YqTj41BAlnes35/pQEnDtCzF3U9ZsEiat0WXZ+UEV0rtg8tDNVKmdF15vZ1qNB0ujG9VeixOUbOPWU+4B0xPzPSQ2aAY8TCbbp25cmXKIRMXSHlEMcurZOKpx973JVmpAqU+WZ1i2SELmkRNwKxbv62qtUxMOUNCZUy1rrRjfKyzt0SosO7K/9hxDwy4gB2P3+eoOD6dP3YxBNV4EKerfNpjKiRzqAT37LpIxCAMjHnYV4nEVZYLq25QDLXx95YON/RYe49KoAuNtLtcqFZ8t1fhr6bOrg48ksUPaQRBIwoHU4Pj774pLPji3bmORq2mjkBGXQuY/Nht7+SX0yAMjRmffDn7nKxfZ249ZiQtjBaDTOQlh+RdH0WkU4Ie0QQ0L1AwL86GvkGYH9vzx29/OP/86Sj6+X5ofJLdDGQiMIoy/Ne7fZTWIaIEMLHmKsCFQC7uSdYGm5YOOp4WI9pIqm2QczHGenKEQlXK93HgU4eTUAGf3naHiq49QQCbugre1Z0cOikC2m2eKcwREsDBlryhcjIFFQOoYMWPbKR5feOPZYcQlTWYW7fIa2sHpHzLSMmj39+/ZFfOIoZj+pFnOEqyV/WvyCDjBZcCHQzce921sX/qQ/5W2gYTiIozmjd9KFfdvvVkWqMtpIOFrqkpdDBcIPYe++82XPwhBMXpTWHhSU1aO0bnh+5/+kK0VU0koQ//e/T3WXx1DBufu1CA+XmRhUff1SlK/bvJ4ZzAkz2l4816XgaDSDGPCkao4K7XNr6BumgFL936vFpoueoNv2IlOU1mfKc2gcI+GfVm9NRyq/NDjZsGyYwXHWFLz1HV0Ggh/AJn2caa1wWCjjVCIZubPCeqDFk8qlmRFuUk+q5CpR0iO3Qwci92yDSoIWr+yR93Jlhw6SNkz3Agl/i4K2o5zcKaObeb0qnW8a20e4x3FwTCrW1BX2xiBcJ0RY0UUNtnAH8mFmL/S4wxcUJoKXLoIM6t5IBq689KS2979AjtFCVyjqxtcltKrM88wABXd10hM9CaPjjWx6hLraxl7cNq8tF9bILXIzn7WkyIfIL9XQyrrIUknaV3MCxHlcZjmMv6CBUYMkhQRddJy2//+ht7xFg4w4EpsJKQGHjyINPWw/qehL/2L+YDZhX0+EaLH/fz1vbvD0hT1cDhtu4BIgAbZ5t9ymYvcsJAnBiAs1x6CAOpC7H7iNlYsmhB056ZYsl4MIhKW09OPDUQxT80klAINFlY9OjHTq0TWYPPeQVcSS+q1jM9Dg46BABGS22Mx2C3i+DAAEEkA6qKrBO3HZE0kfvP3m7OLyWoAhKoMedNeXCQwSMNHI7JBm8cmQXy6271S0+Goth8MNduYEToKdevq30PRpsdBswIovD+S4XCNC4LZmxbEvtINzfvz1wA89JaQncA5AgQAQ8aIcjv2giaOGcXdznM2sDdJAsJWkSgD51IEnTSEMTFl4MeeqX3t1w3WlN4DxK1fqM754DAZmEAtpMEnf/A0le7TGB/hRIUOR2uR7mwC8DZs4A4Is2XL9OreCH++a1IKOtWx2iWZZZTAzQk+PI3GI7DfhYhsF6rahXhMzvngNAFxotW7kKmHsj4oN3AFmkkkEhDcqIOZ+HGDDi8HAleOocPrh3aJyvf2aKZn25WNiqYg+hjdC5oopzBj1w5u5CdoPaAeYi9NBBHC4wC+eZyaJc6bBwFXjQry9GXLi8T5LqGp4ZeeT5hT3QSAToiYBn+7yNdHnkRAQFaL16IkDAwVyantwX7OCgh/hT47GtF2B2AZw5VdjzZsHlFp85J7j0WX0WS+1hffrUTx+6humktAhIsO0iCPj5wyrQ2t2U0kIJ/3KsODs/eubmB2mdihvH8F0WQcwKteFMRFYGSqycUlzFtMVroUsAulEPsECnMqCDIxZtubLmqD4rvMOy+uHLmWoPCRmxiwAJrWIymR9iQcvGgDhPACsZC3VF+45P/tPf3Z2bnMLN7Yn1klIZwsSInD5OmIcOrCi4gvvImLWdJrPe8gx29IuypxSzLtvSu8OyJlJmKRkWH74IKlt89ZiQEXdKJpPhYSWs8Rj48pTZrh6zYVgimXT+gE7eDWG050i2q6UNhVMx6yLjRWkLumXV/CKCzE4Z1+JwjmZL0EGlMFZm6T2kzwi//5AZExKsARF7dkoZpuyHteCXnjKqa3AWpOHyjTDKpebX6NhXHwgYkMsCy3AqjC3uIAmQJzBtcXJT+lckYxmpDwEBRv3KY/qM2En9kodUgB/6hH9aJy09Lejdf/WIHnqaVCwEmAoFw/VhgHHHN1E0n8ZtxbHLRUqjTIa4V+QMUIA3zep1IP+MAq+S+ozzimBUei8qS8P7LM/1P1LqKTkCGzglaBIGyfRXlgdWp6l0vyjhE88THGcN12G+L/mbNPhDB9aPbfSkO8sM6PUgp1YsCiRQSOezOAdM5nuopghKZrTRsjWiWK48GldBLaWCYYu4Z51kfRCLzwFV/v6XZjUkwDf6ulgUHPgVw0GXMaw/tK8xX6Ogwpb+EoJBtOTMVAtUN/4L088WHMt5i1ZZeUjRTxzWZ03/r8fcxXQRteO10pLLgt71ABgQ/gU4FHEKcBCtjgiYNP9fyTPEgKEmQ2OmgAioAMijR3tOzMymsTjaeXf5vY86D4jsvaAsCa9TVk+/9Gh5KT4gIF8WtHaD9CAOEOYX+RsFPPgb5IxLfRN06u6lr737HBEwHMgw8EqpnQ704aGOGbFiZCSjM/seM39uUTJjf5+9NWK0HJw2P+5GNqd5ecIibt8JqSn3EfBXIwA2P4ciIgKsHqJBhuRvnr4e5gT4tYxOe2sGKfZEf1JDAqDHnN5kvkfAeUUpOPa8MnFUXxj94HFJReQtyKBDWnb5mRGk8Q9wAVmNWxRVO8RKA/UxtM5+8xc4ZUgiaLQIlA0vfgkdYshA5AKgR1zhku77FEWp3QkJ7FDW8LH+R9Kq+Djs4JKgt41Q+POAGuCuP7/BAgpEkfIDX10MJ5t+8rfJ60TAeFkTGoaIEw2MNEBB10pQcIUDXFJluf7eh5w3LgP395AE+h97jfPeuFMs8BnE/HJYu8qB85IqC8SjeYAiQVLz5D3RGAzxpR9MIluO+RxuP02oCOM0iqXQKXtVFfAVGi7W+wjAwJI1fkqf0f/eY9OaxbG30MnaIWl6zPxmIa5/kpCSgaZJEDkFYPZSvKvheFJOHqYT0rgST87GEYb0i4hPSfCqAHCJgUWDdNi4QIC1ML5PWRnZBwn89FPuBEON5ADa6JWNWGckA9eJIAzSq5wQmQcXrHAOCHQNbezMr792av6GWLkMbN9DbXnyA+rI5PMgJQ1dSuX5BQYUnEbLeFjJ7o1+ykXaexLZ0soxg5TpxyoWjQzUWeAA/LBBovxIorJlLkT/U4VnXOpMr4yzZWJKAvw3roPLAAwL9vRz46b1sMNBXLt1+tOS6+GLEqZfBem72aTuMi6Vkc5xZThPyp9NYaGg1osmYn0GdWWOADgcjDMMEtd9aX595ZlKkT2/QIB11dERpQBXDq0Jv/Rp5YX4gCS1eiUpswmlFBCAtc5xcyCzYCQBgWMBQC988aHy4C4VhuEL6H/+CN1oNMxL4OdK++CIUj+gGEs+/ZbEbQQD3n2SNpB9TpIyzvNIWOD365DukQgEtVQglN4PZSIf3oIG0Nr6eQZYMPv8zLwKnFcy483K0thOZVnf+0+4JXpQkNp2CVL+P6gh4HwUwpkvqiEBKcLjzppA9Swq+zkJRuigkwAx4+9VR1BxmVTQqGyNvPTpBYb6hFlaFXJKGd81ixL6eOcJeFQaaPOiyL8XBOlxtyUvrD2vg0U0LmNJQ6lDGYH67Vdw7Z1ivdL3hFrnysQ+wACCj8JmKu5KBASc7YIgzUeFYio2fHB54Z7o5x9MNpFvLhopH1HO40AfXAHuHVsRe/1JdcahcYmySCkjQEEgbthROUDb5p6IeyMuEfGh/Vvu3z2nRTAQV0S3KRtuKGNig5I5Mm5VNj35rtK9Y41Shmc/tIBYIHAOgAVmjoFi6r8UF1KyJ05x67Ms8ICTYtFK5+nrJjmD/OCQYll+udm67NZ7T267ja4XxFXFsESwAHCoylw8r3JAvEdDSiAW/ouesrH5lfUpBiAWo990LuPz5xUrGGCNDyiWVyJPrvWyTV6zpAmVC2Jes5AyAvz+jEWcNwCVinmFoNUpFUM6xHd9Tw+s4jPYuN6S5SKTqBhSzm+PbbAW9h/6jHL7muH9gliJZFTjz563e0FAVpgyBGFh8wvrow6tLKjgPQq05/j3I0RAYel+zgBl+fQ/ftZFqWM9opRVDCpQTOG+h+92hHOCc0BKJQgpEfBkXE+cT+FgShmNEjdMckKK0lqjKLnDVVDF6c98oUN+AI4fl85K2rZGddd6UoZzgqoGC/ON1P3j9EnqJKKFewILyYNTcI475ecJg5WisWarNTEKVYy9/5l31WpD3VDBHgQlqxxmvsRTSPefOS+pIZlVvaVCkXGRQupdNha8q4Lf1mYy4kuXKoARM2cAAbGiD15SFNIAa138c9wXnFvTLEmePIOkbdkvqCGAIGlJBoSDL/fPTs+dnZqaNX9/9+wsyoQn5hpfmJzjz523zCUnBvXkEZ4/z7hjeJ5EkDtapmQSA1bGPs+NybrxYlHStVRJYmbAmdIBxONmDoni29M4YjA9d/2O+ft3kjN3ZnDFDydgEncizL1leXHmD+r6FkCThecG5wvr1+stexMbEJN+xjWt80fYxtYJ4nZHGWZOilORsCRoLQQDkviDD89OT02/jgvrbAAABzJJREFUOTktfh903JmcTBIHJifn8N/MTy3fmf0V37kCZEiJQGkdV5Ss4XHFsib2+d6noRsjFtjxi6ZLFYLqCbgzenl26s70nenZuyCg/w7nfePfzBEHZudm3jK/NveO/j5jpK/z7M2483AYdjgR/1wMoEnFMkGssO8DJjoMwrwH4jEpdNzyozsfEfTqFfmFyeu42gSapzw7OdeM38yvTb5H9kgTwnx1SSm0bdQrK7yX9dkFkc/7QhGNtw0qeGAcRtBSw2UvpiIBQmbxlTsfCSpZ35y8LvF8XFo8OdcIPLIcnPsVV8JUXAQP1VKcDfP3Qg0nop+TARjRjlcJ4pKaXUzSle5KKQF3BZwZP5r9QFBB8IW5WdXylaWTc+W04Ktz7+vVwESvCsATKlekiniVYtk2fJR97svzE74GNLDGIIQiX7OgRqILbuiVO79KQeELc3c5/FuIgDLa+HfmPtJC+8k3YT4SEORo0ltW4UUoiMjGvsBbbVbGTzFRNzYMj7ilJlsFvAVX/P3ZeQL+cnKWGICVSARY1PLa3AfaFB6TJKwt3fh6b2K/Ytlb90Ve6CJsqocp5gx3IzALVpvnwyLuG8UfTn8kkB+2WLgO8NUWqxyAFXxEM9SUo0IDM9p64Ajy4peICz7DFyAAc3ej2H3QjuhAhwE0VQdTzumHN7kOYMMvgAMka4uyeG62jGKA70A8yFAtpJmKvqK6XG/Jt2FeNaMutp99oedA8BLWrouVARBxL34qKuPRwI/mfr8gguspdV88OVkGRpi/MwMCJJrUBx+Ctma9UmgfbdRLFcOn2Rd8jUg81iiIubFqtD3z45fFeScsEAFcB1CQfWHyGh0KUAloJKl/Z+5XWpU7klTR1wlL2VK/XrJk0sWBX/ApiA1BCK8WIzwQKiKd4nyOAAKAA9wKFViBRY3AOAdIBEQAHS5HilW3CwCxpauYeNFV9SVe5jRxCvPJbaWX4PdbExsX4kBwgBOArb8wd41rAHRgkuuA5cdz75AOQAaVMaws5XfVZCuWfH6hFPvibzPaKYiZE5H10P+KRLWYCgpVK+AI+MLkXTUU1hMHSPtf4yKAFlTaN+KvTHZHIyzAUf+lXq21DS/EksQVkRg8krAlgQNsKg7Mc0AlwMLjn8XXp8pgmWZ4Q5ihpN+S2AjtKKrpapYsGfW2L/eaO7zPB+6AVSSGgYhCTny8TEiJgFsBVA4i4BzQ6xfNRUGARSQOWCyFQV831rcecHQDprYkHF/yJXdpsTgpwN7wGKJDIT8x2kwEmH8EOavR+AvvnkmFoIv6oYSSxfziLICoqHSoE2IoDNm7SQ1CiS/9ZrGV4WgVwrFNMcwvSayo/oIKRDPv0HwmwO6Fa9Pc8+v1i+fmyqB8Zu4L1gw1wRJwu3INwpJVtq4Nf8xrxSL7BEmzKTJajpUzOzkB3wsTEpLwV08Pqa5Xv2i6v4xOih0MYyZuVTnWL+xCZ0VvKSyt38j+iBer1Yb7gEeaTcPezgfzEbJ0C6/HQBnpjJRCLNFz64BwpLy24DjWx5X/43/UCzd10XAfLoTSHBhObDQL9+WDakbKAw89xQQ8L6D8QE1WoHghFJoyurrGDIz9kS/XO2IgChKx8eyU+fN0jPbOI086nmTRc6WQLCpxGQcSMEMYYNDna2Tsj329YBgUSNrWaHi0WbwnAD2FIrQ0mT13DUQDt47CYMxL8s/oqk98BS/7zA2HD2UTFKEuXgwwUrNRcgGUlvOIUN23xEUh6ivr7WOd+JuM1prSKvYVPBXgATAIZhiJDTRZ0K7k26Y4hHqUPDfkLOBU5IXqMVWCP0H33NbE2FdEQR8iQzEjGI1FRtEC4AGXSgT9zxmP7+ErCrtKR+uLjSCkEOOQnewrenLD0T4yQ1xYiwvrR5torzz7wWNJ2QAyWL21JTE8VuMnRhSVJnxf2fooQ+Ka1mrsHHLFdZ9o3ro4vxVuCVwAAl4kE8R7N33F2fge8yv24a/0Va+r8B7ZgXKBq3icv9a22G9UlY5ahXjVcddYPY5DEvcRAQZ99rGv+GW3mXizaQRYpFiEwpY4sQHv9MQB5i68T6je58NNpZEhb0+5SOwoqk+MjTWyr/jRvBrunxpoJvuXFI+9DizBG6ZjVyJh3OWfwMtevd0Wvnxhly+RqDGwr/wRKs7gPd81Rk4CJN5Gr9QZrsPecXM47vsSVZysjEVvJrr/NG8gz4IYpiMwcl6YpJoQXuiHq6CBAGo9VcjAG3Aj8SPN7E/0CFvwMuf+yKhfXZ6QmKdIem4T+sIWXCudiHT/KV/AruGve6YXfxtTRVKFTw1JelMgWD9Mb/r9U752XL29Gu+7hkXgRpIe9U3HeLEjXsE9MVSPt+/W/Dne/Z6Blw33T+ON32G8cB6vG07Eh+Px4Qm8X6k7m/15HkD+RGyav3Y8HBueAA3DCW+xS2R/zifDE7L78KLlSCLuc/T4v/Te/3/krE15rr1l0QAAAABJRU5ErkJggg==";
  // Decimals used by blocks below state.legacyBlockBoundary (pre-upgrade).
  public let LEGACY_DECIMALS : Nat8 = 4;
  // Transfer fee bounds accepted by set_fee (base units).
  public let MIN_FEE : Nat = 0;
  public let MAX_FEE : Nat = 10_000;
  // Longest accepted memo (bytes).
  public let MAX_MEMO_BYTES : Nat = 32;
  // Deduplication window and permitted clock drift (nanoseconds).
  let TX_WINDOW_NS : Nat = 86_400_000_000_000; // 24 h
  let PERMITTED_DRIFT_NS : Nat = 120_000_000_000; // 2 min
  // Per-call caps.
  let MAX_BLOCKS_PER_CALL : Nat = 100;
  let MAX_DEDUP_PRUNE : Nat = 50;

  let ICRC1_URL = "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-1";
  let ICRC2_URL = "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-2";
  let ICRC3_URL = "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-3";
  let ICRC10_URL = "https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-10/ICRC-10.md";

  // GenericError codes (1 was the removed admin mint, 2 the removed burn
  // authorization, 3 the removed transfer freeze).
  let MEMO_ERROR_CODE : Nat = 4;
  let ZERO_AMOUNT_ERROR_CODE : Nat = 5;
  let MINTING_ACCOUNT_ERROR_CODE : Nat = 6;
  let SELF_APPROVE_ERROR_CODE : Nat = 7;
  // Transfers to the minting account (canister, null subaccount) are refused.
  public let BURN_REFUSED_ERROR_CODE : Nat = 8;
  public let BURN_REFUSED_MESSAGE : Text = "Tokens cannot be burned; transfers to the contract address are refused.";
  let MEMO_MESSAGE = "Memo exceeds 32 bytes";
  let ZERO_AMOUNT_MESSAGE = "Amount must be greater than zero";

  // --- Special accounts ------------------------------------------------------

  // Fixed 32-byte fee collector subaccount (printable ASCII). Stable account
  // identifier: never change these bytes.
  public let FEE_COLLECTOR_SUBACCOUNT : Blob = "FEE-COLLECTOR-TTTI-P-00000000001";

  // Fee collector: this canister's principal + FEE_COLLECTOR_SUBACCOUNT. Every
  // transfer / transfer_from / approve fee is credited here.
  public func feeCollectorAccount(canister : Principal) : Account {
    { owner = canister; subaccount = ?FEE_COLLECTOR_SUBACCOUNT };
  };

  // ICRC-1 minting account: this canister's principal with the default (null)
  // subaccount. Tokens cannot be burned: transfers to it are refused.
  public func burnAccount(canister : Principal) : Account {
    { owner = canister; subaccount = null };
  };

  // Fixed 32-byte buyback escrow subaccount (printable ASCII), distinct from
  // the minting account and the fee collector. Stable account identifier:
  // never change these bytes.
  public let BUYBACK_ESCROW_SUBACCOUNT : Blob = "BUYBACK-ESCROW-TTTI-T-0000000001";

  // Buyback escrow: this canister's principal + BUYBACK_ESCROW_SUBACCOUNT.
  // Transfers to it are accepted; only internal calls (caller = canister)
  // from the buyback completion and cancellation debit it.
  public func buybackEscrowAccount(canister : Principal) : Account {
    { owner = canister; subaccount = ?BUYBACK_ESCROW_SUBACCOUNT };
  };

  // --- SHA-256 (pure Motoko) -------------------------------------------------

  let SHA256_K : [Nat32] = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  func rotr(x : Nat32, n : Nat32) : Nat32 {
    (x >> n) | (x << (32 - n));
  };

  func sha256(data : Blob) : Blob {
    let bytes = data.toArray();
    let len = bytes.size();
    let bitLen = len * 8;
    // Padded message: data + 0x80 + zeros + 64-bit big-endian bit length.
    let paddedLen = (((len + 8) / 64) + 1) * 64;
    let lenFieldStart = Nat.sub(paddedLen, 8);
    let bitLen64 = bitLen.toNat64();
    let padded = Array.tabulate<Nat8>(paddedLen, func(i) {
      if (i < len) { bytes[i] }
      else if (i == len) { 0x80 }
      else if (i >= lenFieldStart) {
        let shift = Nat.sub(Nat.sub(paddedLen, 1), i) * 8;
        ((bitLen64 >> shift.toNat64()) & 0xff).toNat8();
      } else { 0 };
    });
    var h0 : Nat32 = 0x6a09e667;
    var h1 : Nat32 = 0xbb67ae85;
    var h2 : Nat32 = 0x3c6ef372;
    var h3 : Nat32 = 0xa54ff53a;
    var h4 : Nat32 = 0x510e527f;
    var h5 : Nat32 = 0x9b05688c;
    var h6 : Nat32 = 0x1f83d9ab;
    var h7 : Nat32 = 0x5be0cd19;
    var chunk = 0;
    while (chunk < paddedLen) {
      let w = Array.tabulate<Nat32>(64, func(i) {
        if (i < 16) {
          (padded[chunk + i * 4].toNat32() << 24)
          | (padded[chunk + i * 4 + 1].toNat32() << 16)
          | (padded[chunk + i * 4 + 2].toNat32() << 8)
          | padded[chunk + i * 4 + 3].toNat32();
        } else {
          0;
        };
      }).toVarArray();
      var wi = 16;
      while (wi < 64) {
        let s0 = rotr(w[wi - 15], 7) ^ rotr(w[wi - 15], 18) ^ (w[wi - 15] >> 3);
        let s1 = rotr(w[wi - 2], 17) ^ rotr(w[wi - 2], 19) ^ (w[wi - 2] >> 10);
        w[wi] := w[wi - 16] +% s0 +% w[wi - 7] +% s1;
        wi += 1;
      };
      var a = h0;
      var b = h1;
      var c = h2;
      var d = h3;
      var e = h4;
      var f = h5;
      var g = h6;
      var h = h7;
      var i = 0;
      while (i < 64) {
        let s1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        let ch = (e & f) ^ (^e & g);
        let temp1 = h +% s1 +% ch +% SHA256_K[i] +% w[i];
        let s0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        let maj = (a & b) ^ (a & c) ^ (b & c);
        let temp2 = s0 +% maj;
        h := g;
        g := f;
        f := e;
        e := d +% temp1;
        d := c;
        c := b;
        b := a;
        a := temp1 +% temp2;
        i += 1;
      };
      h0 := h0 +% a;
      h1 := h1 +% b;
      h2 := h2 +% c;
      h3 := h3 +% d;
      h4 := h4 +% e;
      h5 := h5 +% f;
      h6 := h6 +% g;
      h7 := h7 +% h;
      chunk += 64;
    };
    let out = Array.tabulate(32, func(i) {
      let word = switch (i / 4) {
        case (0) h0;
        case (1) h1;
        case (2) h2;
        case (3) h3;
        case (4) h4;
        case (5) h5;
        case (6) h6;
        case (_) h7;
      };
      let shift = Nat.sub(3, i % 4) * 8;
      ((word >> shift.toNat32()) & 0xff).toNat8();
    });
    out.toBlob();
  };

  // --- Byte helpers ----------------------------------------------------------

  // Unsigned LEB128.
  func leb128(n : Nat) : [Nat8] {
    var value = n;
    let out = List.empty<Nat8>();
    loop {
      var byte = (value % 128).toNat8();
      value := value / 128;
      if (value > 0) {
        byte := byte | 0x80;
      };
      out.add(byte);
      if (value == 0) { break };
    };
    out.toArray();
  };

  // Signed LEB128.
  func sleb128(i : Int) : [Nat8] {
    var value = i;
    let out = List.empty<Nat8>();
    loop {
      let low = ((value % 128) + 128) % 128;
      value := (value - low) / 128;
      let lowNat = Int.abs(low);
      let signBitSet = lowNat >= 64;
      if ((value == 0 and not signBitSet) or (value == -1 and signBitSet)) {
        out.add(lowNat.toNat8());
        break;
      };
      out.add((lowNat + 128).toNat8());
    };
    out.toArray();
  };

  func joinBytes(parts : [[Nat8]]) : [Nat8] {
    let out = List.empty<Nat8>();
    for (part in parts.values()) {
      for (b in part.values()) {
        out.add(b);
      };
    };
    out.toArray();
  };

  // --- ICRC-3 representation-independent hash --------------------------------

  public func hashValue(value : Value) : Blob {
    switch (value) {
      case (#Nat(n)) sha256(leb128(n).toBlob());
      case (#Int(i)) sha256(sleb128(i).toBlob());
      case (#Text(t)) sha256(t.encodeUtf8());
      case (#Blob(b)) sha256(b);
      case (#Array(items)) {
        sha256(joinBytes(items.map(func item = hashValue(item).toArray())).toBlob());
      };
      case (#Map(fields)) {
        let pairs = fields.map(
          func((key, v)) = joinBytes([sha256(key.encodeUtf8()).toArray(), hashValue(v).toArray()]).toBlob()
        );
        let sorted = pairs.sort();
        sha256(joinBytes(sorted.map(func p = p.toArray())).toBlob());
      };
    };
  };

  // --- ICRC-3 tip hash tree (IC hash-tree format) -----------------------------
  //
  // The tip tree is a fork of two labelled leaves, labels in lexicographic order:
  //   last_block_hash  -> 32-byte hash of the latest block (state.lastBlockHash)
  //   last_block_index -> unsigned LEB128 of the latest block index

  // SHA-256 over (len(sep) | sep | payload), the IC hash-tree domain separation.
  func domainHash(sep : Text, payload : [Nat8]) : [Nat8] {
    let s = sep.encodeUtf8().toArray();
    sha256(joinBytes([[s.size().toNat8()], s, payload]).toBlob()).toArray();
  };

  func leafHash(data : [Nat8]) : [Nat8] {
    domainHash("ic-hashtree-leaf", data);
  };

  func labeledHash(name : Text, subtreeHash : [Nat8]) : [Nat8] {
    domainHash("ic-hashtree-labeled", joinBytes([name.encodeUtf8().toArray(), subtreeHash]));
  };

  func forkHash(left : [Nat8], right : [Nat8]) : [Nat8] {
    domainHash("ic-hashtree-fork", joinBytes([left, right]));
  };

  // CBOR byte string (major type 2). Inputs here are at most a few dozen bytes.
  func cborBytes(data : [Nat8]) : [Nat8] {
    let n = data.size();
    let header : [Nat8] = if (n < 24) {
      [(64 + n).toNat8()];
    } else {
      [0x58, n.toNat8()];
    };
    header.concat(data);
  };

  // Leaf: [3, bytes]
  func cborLeaf(data : [Nat8]) : [Nat8] {
    joinBytes([[0x82, 0x03], cborBytes(data)]);
  };

  // Labeled: [2, label, subtree]
  func cborLabeled(name : Text, subtree : [Nat8]) : [Nat8] {
    joinBytes([[0x83, 0x02], cborBytes(name.encodeUtf8().toArray()), subtree]);
  };

  func tipRootHash(hash : Blob, index : Nat) : Blob {
    forkHash(
      labeledHash("last_block_hash", leafHash(hash.toArray())),
      labeledHash("last_block_index", leafHash(leb128(index))),
    ).toBlob();
  };

  type TipTree = { rootHash : Blob; hashTree : Blob };

  // The tip tree for the latest block, or null for an empty log.
  func tipTree(ledger : Ledger) : ?TipTree {
    let next = ledger.state.nextBlockIndex;
    if (next == 0) {
      return null;
    };
    let hash = switch (ledger.state.lastBlockHash) {
      case (null) { return null };
      case (?h) { h };
    };
    let tip = Nat.sub(next, 1);
    // Self-describe tag 55799, then fork = [1, left, right].
    let hashTree = joinBytes([
      [0xd9, 0xd9, 0xf7],
      [0x83, 0x01],
      cborLabeled("last_block_hash", cborLeaf(hash.toArray())),
      cborLabeled("last_block_index", cborLeaf(leb128(tip))),
    ]);
    ?{ rootHash = tipRootHash(hash, tip); hashTree = hashTree.toBlob() };
  };

  // Does `haystack` contain `needle` as a contiguous byte run?
  func containsBytes(haystack : Blob, needle : Blob) : Bool {
    let h = haystack.toArray();
    let n = needle.toArray();
    var i = 0;
    var found = false;
    while (not found and i + n.size() <= h.size()) {
      var j = 0;
      var matches = true;
      while (matches and j < n.size()) {
        if (h[i + j] != n[j]) { matches := false };
        j += 1;
      };
      if (matches) { found := true };
      i += 1;
    };
    found;
  };

  // --- Internal helpers ------------------------------------------------------

  // ICRC-1: an all-zero subaccount is the default (null) subaccount.
  func normalize(a : Account) : Account {
    switch (a.subaccount) {
      case (?s) {
        if (s.toArray().all(func b = b == 0)) {
          { owner = a.owner; subaccount = null };
        } else {
          a;
        };
      };
      case (null) a;
    };
  };

  func accountOf(owner : Principal, subaccount : ?Subaccount) : Account {
    normalize({ owner; subaccount });
  };

  func now() : Timestamp {
    Int.abs(Time.now()).toNat64();
  };

  func getBalance(ledger : Ledger, account : Account) : Nat {
    ledger.balances.get(account) ?? 0;
  };

  func setBalance(ledger : Ledger, account : Account, amount : Nat) {
    if (amount == 0) {
      ledger.balances.remove(account);
    } else {
      ledger.balances.add(account, amount);
    };
  };

  func credit(ledger : Ledger, account : Account, amount : Nat) {
    setBalance(ledger, account, getBalance(ledger, account) + amount);
  };

  func debit(ledger : Ledger, account : Account, amount : Nat) {
    setBalance(ledger, account, Nat.sub(getBalance(ledger, account), amount));
  };

  func genericError(code : Nat, message : Text) : { #GenericError : { error_code : Nat; message : Text } } {
    #GenericError({ error_code = code; message });
  };

  func memoTooLong(memo : ?Blob) : Bool {
    switch (memo) {
      case (?m) m.size() > MAX_MEMO_BYTES;
      case (null) false;
    };
  };

  type TimeError = {
    #TooOld;
    #CreatedInFuture : { ledger_time : Timestamp };
  };

  // created_at_time window: older than now - (TX_WINDOW + DRIFT) is TooOld,
  // more than DRIFT ahead of now is CreatedInFuture.
  func checkCreatedAt(created : ?Timestamp, nowTs : Timestamp) : ?TimeError {
    switch (created) {
      case (null) null;
      case (?t) {
        let c = t.toNat();
        let n = nowTs.toNat();
        if (c + TX_WINDOW_NS + PERMITTED_DRIFT_NS < n) {
          ?(#TooOld);
        } else if (c > n + PERMITTED_DRIFT_NS) {
          ?(#CreatedInFuture({ ledger_time = nowTs }));
        } else {
          null;
        };
      };
    };
  };

  func accountValue(a : Account) : Value {
    switch (a.subaccount) {
      case (?sub) #Array([#Blob(a.owner.toBlob()), #Blob(sub)]);
      case (null) #Array([#Blob(a.owner.toBlob())]);
    };
  };

  func addOptNat(fields : List.List<(Text, Value)>, key : Text, value : ?Nat) {
    switch (value) {
      case (?n) fields.add((key, #Nat(n)));
      case (null) {};
    };
  };

  func addOptTime(fields : List.List<(Text, Value)>, key : Text, value : ?Timestamp) {
    switch (value) {
      case (?t) fields.add((key, #Nat(t.toNat())));
      case (null) {};
    };
  };

  func addOptBlob(fields : List.List<(Text, Value)>, key : Text, value : ?Blob) {
    switch (value) {
      case (?b) fields.add((key, #Blob(b)));
      case (null) {};
    };
  };

  // Top-level effective fee: present only when the caller did not set tx.fee.
  func topFee(provided : ?Nat, charged : Nat) : ?Nat {
    switch (provided) {
      case (?_) null;
      case (null) ?charged;
    };
  };

  // Credit a charged fee to the fee collector; returns the collector account
  // for the block's fee_col, or null when no fee was charged.
  func creditFee(ledger : Ledger, canister : Principal, amount : Nat) : ?Account {
    if (amount == 0) {
      return null;
    };
    let collector = feeCollectorAccount(canister);
    credit(ledger, collector, amount);
    ?collector;
  };

  // Appends a standard ICRC-3 generic block:
  // { btype; ts; fee?; fee_col?; phash?; tx } and re-certifies the tip.
  func appendBlock(ledger : Ledger, btype : Text, ts : Timestamp, fee : ?Nat, feeCol : ?Account, tx : List.List<(Text, Value)>) : Nat {
    let fields = List.empty<(Text, Value)>();
    fields.add(("btype", #Text(btype)));
    fields.add(("ts", #Nat(ts.toNat())));
    addOptNat(fields, "fee", fee);
    switch (feeCol) {
      case (?c) fields.add(("fee_col", accountValue(c)));
      case (null) {};
    };
    addOptBlob(fields, "phash", ledger.state.lastBlockHash);
    fields.add(("tx", #Map(tx.toArray())));
    let block : Value = #Map(fields.toArray());
    let hash = hashValue(block);
    let index = ledger.state.nextBlockIndex;
    ledger.blocks.add(index, block);
    ledger.state.nextBlockIndex := index + 1;
    ledger.state.lastBlockHash := ?hash;
    CertifiedData.set(tipRootHash(hash, index));
    index;
  };

  // --- Deduplication -----------------------------------------------------------

  func dedupKey(btype : Text, tx : List.List<(Text, Value)>) : Blob {
    hashValue(#Map([("btype", #Text(btype)), ("tx", #Map(tx.toArray()))]));
  };

  func findDuplicate(ledger : Ledger, created : ?Timestamp, key : Blob) : ?Nat {
    switch (created) {
      case (null) null;
      case (?_) ledger.dedup.get(key);
    };
  };

  func recordDedup(ledger : Ledger, created : ?Timestamp, key : Blob, index : Nat, nowTs : Timestamp) {
    switch (created) {
      case (null) {};
      case (?_) {
        ledger.dedup.add(key, index);
        ledger.dedupQueue.add(index, { txHash = key; ledgerTime = nowTs });
      };
    };
  };

  // Drops at most MAX_DEDUP_PRUNE entries whose window has fully elapsed.
  // Entries are written in ledger-time order, so scanning stops at the first
  // entry that is still live.
  func pruneDedup(ledger : Ledger, nowTs : Timestamp) {
    let n = nowTs.toNat();
    let expired = List.empty<(Nat, Blob)>();
    for ((index, entry) in ledger.dedupQueue.entries()) {
      if (expired.size() >= MAX_DEDUP_PRUNE or entry.ledgerTime.toNat() + TX_WINDOW_NS + 2 * PERMITTED_DRIFT_NS >= n) {
        break;
      };
      expired.add((index, entry.txHash));
    };
    for ((index, key) in expired.values()) {
      ledger.dedupQueue.remove(index);
      if (ledger.dedup.get(key) == ?index) {
        ledger.dedup.remove(key);
      };
    };
  };

  // --- Approvals -------------------------------------------------------------

  // The non-expired approval of `spender` on `account`, if any.
  func activeApproval(ledger : Ledger, account : Account, spender : Account, nowTs : Timestamp) : ?Approval {
    let approval = switch (ledger.approvals.get(account)) {
      case (?spenders) spenders.get(spender);
      case (null) null;
    };
    switch (approval) {
      case (?a) {
        switch (a.expires_at) {
          case (?expiry) { if (expiry <= nowTs) { null } else { ?a } };
          case (null) ?a;
        };
      };
      case (null) null;
    };
  };

  // Sets (or removes, when amount is 0) an approval.
  func setApproval(ledger : Ledger, from : Account, spender : Account, amount : Nat, expiresAt : ?Timestamp) {
    switch (ledger.approvals.get(from)) {
      case (?spenders) {
        if (amount == 0) {
          spenders.remove(spender);
          if (spenders.isEmpty()) {
            ledger.approvals.remove(from);
          };
        } else {
          spenders.add(spender, { amount; expires_at = expiresAt });
        };
      };
      case (null) {
        if (amount > 0) {
          let spenders = Map.empty<Account, Approval>();
          spenders.add(spender, { amount; expires_at = expiresAt });
          ledger.approvals.add(from, spenders);
        };
      };
    };
  };

  // --- ICRC-1 ----------------------------------------------------------------

  public func name() : Text {
    TOKEN_NAME;
  };

  public func symbol() : Text {
    TOKEN_SYMBOL;
  };

  public func decimals() : Nat8 {
    TOKEN_DECIMALS;
  };

  public func fee(ledger : Ledger) : Nat {
    ledger.state.fee;
  };

  public func totalSupply(ledger : Ledger) : Nat {
    ledger.state.totalSupply;
  };

  public func maxSupply() : Nat {
    TOKEN_MAX_SUPPLY;
  };

  public func balanceOf(ledger : Ledger, account : Account) : Nat {
    getBalance(ledger, normalize(account));
  };

  public func metadata(ledger : Ledger) : [(Text, Icrc.MetadataValue)] {
    [
      ("icrc1:name", #Text(TOKEN_NAME)),
      ("icrc1:symbol", #Text(TOKEN_SYMBOL)),
      ("icrc1:decimals", #Nat(TOKEN_DECIMALS.toNat())),
      ("icrc1:fee", #Nat(ledger.state.fee)),
      ("icrc1:max_memo_length", #Nat(MAX_MEMO_BYTES)),
      ("icrc1:max_supply", #Nat(TOKEN_MAX_SUPPLY)),
      ("icrc1:logo", #Text(TOKEN_LOGO)),
    ];
  };

  public func supportedStandards() : [Icrc.SupportedStandard] {
    [
      { name = "ICRC-1"; url = ICRC1_URL },
      { name = "ICRC-2"; url = ICRC2_URL },
      { name = "ICRC-3"; url = ICRC3_URL },
      { name = "ICRC-10"; url = ICRC10_URL },
    ];
  };

  // The ICRC-1 minting account (= burn account).
  public func mintingAccount(canister : Principal) : ?Account {
    ?burnAccount(canister);
  };

  // A "1xfer" whose fee is credited to the fee collector. A transfer to the
  // minting account is refused (nothing debited, no block written).
  public func transfer(ledger : Ledger, canister : Principal, caller : Principal, args : Icrc.TransferArgs) : Icrc.TransferResult {
    let nowTs = now();
    pruneDedup(ledger, nowTs);
    if (memoTooLong(args.memo)) {
      return #Err(genericError(MEMO_ERROR_CODE, MEMO_MESSAGE));
    };
    switch (checkCreatedAt(args.created_at_time, nowTs)) {
      case (?e) { return #Err(e) };
      case (null) {};
    };
    let minting = burnAccount(canister);
    let from = accountOf(caller, args.from_subaccount);
    let to = normalize(args.to);
    if (from == minting) {
      return #Err(genericError(MINTING_ACCOUNT_ERROR_CODE, "Transfers from the minting account are not allowed"));
    };
    if (to == minting) {
      return #Err(genericError(BURN_REFUSED_ERROR_CODE, BURN_REFUSED_MESSAGE));
    };
    if (args.amount == 0) {
      return #Err(genericError(ZERO_AMOUNT_ERROR_CODE, ZERO_AMOUNT_MESSAGE));
    };
    let currentFee = ledger.state.fee;
    if ((args.fee ?? currentFee) != currentFee) {
      return #Err(#BadFee({ expected_fee = currentFee }));
    };
    let tx = List.empty<(Text, Value)>();
    tx.add(("from", accountValue(from)));
    tx.add(("to", accountValue(to)));
    tx.add(("amt", #Nat(args.amount)));
    addOptNat(tx, "fee", args.fee);
    addOptBlob(tx, "memo", args.memo);
    addOptTime(tx, "created_at_time", args.created_at_time);
    let key = dedupKey("1xfer", tx);
    switch (findDuplicate(ledger, args.created_at_time, key)) {
      case (?original) { return #Err(#Duplicate({ duplicate_of = original })) };
      case (null) {};
    };
    let balance = getBalance(ledger, from);
    if (balance < args.amount + currentFee) {
      return #Err(#InsufficientFunds({ balance }));
    };
    debit(ledger, from, args.amount + currentFee);
    credit(ledger, to, args.amount);
    let collector = creditFee(ledger, canister, currentFee);
    let index = appendBlock(ledger, "1xfer", nowTs, topFee(args.fee, currentFee), collector, tx);
    recordDedup(ledger, args.created_at_time, key, index, nowTs);
    #Ok(index);
  };

  // --- ICRC-2 ----------------------------------------------------------------

  public func approve(ledger : Ledger, canister : Principal, caller : Principal, args : Icrc.ApproveArgs) : Icrc.ApproveResult {
    let nowTs = now();
    pruneDedup(ledger, nowTs);
    if (memoTooLong(args.memo)) {
      return #Err(genericError(MEMO_ERROR_CODE, MEMO_MESSAGE));
    };
    switch (checkCreatedAt(args.created_at_time, nowTs)) {
      case (?e) { return #Err(e) };
      case (null) {};
    };
    let from = accountOf(caller, args.from_subaccount);
    let spender = normalize(args.spender);
    if (spender.owner == from.owner) {
      return #Err(genericError(SELF_APPROVE_ERROR_CODE, "Cannot approve yourself as spender"));
    };
    if (from == burnAccount(canister)) {
      return #Err(genericError(MINTING_ACCOUNT_ERROR_CODE, "The minting account cannot approve"));
    };
    switch (args.expires_at) {
      case (?expiry) {
        if (expiry <= nowTs) {
          return #Err(#Expired({ ledger_time = nowTs }));
        };
      };
      case (null) {};
    };
    let currentFee = ledger.state.fee;
    if ((args.fee ?? currentFee) != currentFee) {
      return #Err(#BadFee({ expected_fee = currentFee }));
    };
    let tx = List.empty<(Text, Value)>();
    tx.add(("from", accountValue(from)));
    tx.add(("spender", accountValue(spender)));
    tx.add(("amt", #Nat(args.amount)));
    addOptNat(tx, "expected_allowance", args.expected_allowance);
    addOptTime(tx, "expires_at", args.expires_at);
    addOptNat(tx, "fee", args.fee);
    addOptBlob(tx, "memo", args.memo);
    addOptTime(tx, "created_at_time", args.created_at_time);
    let key = dedupKey("2approve", tx);
    switch (findDuplicate(ledger, args.created_at_time, key)) {
      case (?original) { return #Err(#Duplicate({ duplicate_of = original })) };
      case (null) {};
    };
    let balance = getBalance(ledger, from);
    if (balance < currentFee) {
      return #Err(#InsufficientFunds({ balance }));
    };
    let currentAllowance = switch (activeApproval(ledger, from, spender, nowTs)) {
      case (?a) a.amount;
      case (null) 0;
    };
    switch (args.expected_allowance) {
      case (?expected) {
        if (expected != currentAllowance) {
          return #Err(#AllowanceChanged({ current_allowance = currentAllowance }));
        };
      };
      case (null) {};
    };
    debit(ledger, from, currentFee);
    let collector = creditFee(ledger, canister, currentFee);
    setApproval(ledger, from, spender, args.amount, args.expires_at);
    let index = appendBlock(ledger, "2approve", nowTs, topFee(args.fee, currentFee), collector, tx);
    recordDedup(ledger, args.created_at_time, key, index, nowTs);
    #Ok(index);
  };

  // Expired allowances report 0.
  public func allowance(ledger : Ledger, args : Icrc.AllowanceArgs) : Icrc.Allowance {
    switch (activeApproval(ledger, normalize(args.account), normalize(args.spender), now())) {
      case (?a) { { allowance = a.amount; expires_at = a.expires_at } };
      case (null) { { allowance = 0; expires_at = null } };
    };
  };

  // The allowance must cover amount + fee; after a partial spend the remaining
  // allowance keeps its original expires_at (removed when it reaches 0). A
  // transfer_from to the minting account is refused before any allowance or
  // balance is touched.
  public func transferFrom(ledger : Ledger, canister : Principal, caller : Principal, args : Icrc.TransferFromArgs) : Icrc.TransferFromResult {
    let nowTs = now();
    pruneDedup(ledger, nowTs);
    if (memoTooLong(args.memo)) {
      return #Err(genericError(MEMO_ERROR_CODE, MEMO_MESSAGE));
    };
    switch (checkCreatedAt(args.created_at_time, nowTs)) {
      case (?e) { return #Err(e) };
      case (null) {};
    };
    let minting = burnAccount(canister);
    let spender = accountOf(caller, args.spender_subaccount);
    let from = normalize(args.from);
    let to = normalize(args.to);
    if (from == minting) {
      return #Err(genericError(MINTING_ACCOUNT_ERROR_CODE, "Transfers from the minting account are not allowed"));
    };
    if (to == minting) {
      return #Err(genericError(BURN_REFUSED_ERROR_CODE, BURN_REFUSED_MESSAGE));
    };
    if (args.amount == 0) {
      return #Err(genericError(ZERO_AMOUNT_ERROR_CODE, ZERO_AMOUNT_MESSAGE));
    };
    let currentFee = ledger.state.fee;
    if ((args.fee ?? currentFee) != currentFee) {
      return #Err(#BadFee({ expected_fee = currentFee }));
    };
    let tx = List.empty<(Text, Value)>();
    tx.add(("from", accountValue(from)));
    tx.add(("to", accountValue(to)));
    tx.add(("spender", accountValue(spender)));
    tx.add(("amt", #Nat(args.amount)));
    addOptNat(tx, "fee", args.fee);
    addOptBlob(tx, "memo", args.memo);
    addOptTime(tx, "created_at_time", args.created_at_time);
    let key = dedupKey("1xfer", tx);
    switch (findDuplicate(ledger, args.created_at_time, key)) {
      case (?original) { return #Err(#Duplicate({ duplicate_of = original })) };
      case (null) {};
    };
    let total = args.amount + currentFee;
    let approval = activeApproval(ledger, from, spender, nowTs);
    let currentAllowance = switch (approval) {
      case (?a) a.amount;
      case (null) 0;
    };
    if (currentAllowance < total) {
      return #Err(#InsufficientAllowance({ allowance = currentAllowance }));
    };
    let balance = getBalance(ledger, from);
    if (balance < total) {
      return #Err(#InsufficientFunds({ balance }));
    };
    debit(ledger, from, total);
    let originalExpiry = switch (approval) {
      case (?a) a.expires_at;
      case (null) null;
    };
    setApproval(ledger, from, spender, Nat.sub(currentAllowance, total), originalExpiry);
    credit(ledger, to, args.amount);
    let collector = creditFee(ledger, canister, currentFee);
    let index = appendBlock(ledger, "1xfer", nowTs, topFee(args.fee, currentFee), collector, tx);
    recordDedup(ledger, args.created_at_time, key, index, nowTs);
    #Ok(index);
  };

  // --- ICRC-3 ----------------------------------------------------------------

  // Serves every requested range in request order (each ascending) with direct
  // index lookups, at most MAX_BLOCKS_PER_CALL blocks in total. No archives.
  public func getBlocks(ledger : Ledger, args : [Icrc.GetBlocksArgs]) : Icrc.GetBlocksResult {
    let logLength = ledger.state.nextBlockIndex;
    let out = List.empty<Icrc.Block>();
    for (range in args.values()) {
      let stop = Nat.min(range.start + range.length, logLength);
      var i = range.start;
      while (i < stop and out.size() < MAX_BLOCKS_PER_CALL) {
        switch (ledger.blocks.get(i)) {
          case (?block) out.add({ id = i; block });
          case (null) {};
        };
        i += 1;
      };
    };
    { log_length = logLength; blocks = out.toArray(); archived_blocks = [] };
  };

  public func getArchives() : [Icrc.ArchiveInfo] {
    [];
  };

  public func getTipCertificate(ledger : Ledger) : ?Icrc.DataCertificate {
    let tree = switch (tipTree(ledger)) {
      case (null) { return null };
      case (?t) { t };
    };
    let cert = switch (CertifiedData.getCertificate()) {
      case (null) { return null };
      case (?c) { c };
    };
    // The certificate embeds the canister's certified data. If it does not
    // carry this tree's root hash, the certified data is stale (never set for
    // the current tip), so serve nothing rather than a mismatched pair.
    if (not containsBytes(cert, tree.rootHash)) {
      return null;
    };
    ?{ certificate = cert; hash_tree = tree.hashTree };
  };

  // Re-certify the current tip root hash. Called on every install/upgrade
  // because the IC may clear certified_data on upgrade. No-op for an empty log.
  public func certifyTip(ledger : Ledger) {
    switch (tipTree(ledger)) {
      case (?tree) { CertifiedData.set(tree.rootHash) };
      case (null) {};
    };
  };

  public func supportedBlockTypes() : [Icrc.SupportedBlockType] {
    [
      { block_type = "1xfer"; url = ICRC1_URL },
      { block_type = "2approve"; url = ICRC2_URL },
      { block_type = "1mint"; url = ICRC1_URL },
      { block_type = "1burn"; url = ICRC1_URL },
    ];
  };

  // --- Management ------------------------------------------------------------
  //
  // There is no admin mint and no burn: TTTI-T is created only by the sale
  // delivery (deliverMintFirst), capped at TOKEN_MAX_SUPPLY.

  public func setFee(ledger : Ledger, newFee : Nat) : Token.SetFeeResult {
    if (newFee < MIN_FEE or newFee > MAX_FEE) {
      return #err("Fee out of range: must be between " # MIN_FEE.toText() # " and " # MAX_FEE.toText() # " base units");
    };
    ledger.state.fee := newFee;
    #ok;
  };

  public func feeBounds() : Token.FeeBounds {
    { min = MIN_FEE; max = MAX_FEE };
  };

  public func getFee(ledger : Ledger) : Nat {
    ledger.state.fee;
  };

  public func getMaxSupply() : Nat {
    TOKEN_MAX_SUPPLY;
  };

  public func tokenName() : Text {
    TOKEN_NAME;
  };

  public func tokenSymbol() : Text {
    TOKEN_SYMBOL;
  };

  // TTTI-T that can still be freshly minted: max(0, TOKEN_MAX_SUPPLY -
  // totalSupply). Tokens cannot be burned, so total supply never decreases.
  public func mintableRemaining(ledger : Ledger) : Nat {
    let supply = ledger.state.totalSupply;
    if (supply >= TOKEN_MAX_SUPPLY) 0 else Nat.sub(TOKEN_MAX_SUPPLY, supply);
  };

  // --- Fee collector / legacy history ----------------------------------------

  // The fee collector account and its balance.
  public func feeCollectorInfo(ledger : Ledger, canister : Principal) : FeeCollectorInfo {
    let account = feeCollectorAccount(canister);
    { account; balance = getBalance(ledger, account) };
  };

  // { boundaryIndex = state.legacyBlockBoundary; legacyDecimals = 4; currentDecimals = 8 }.
  public func legacyBlockInfo(ledger : Ledger) : LegacyBlockInfo {
    {
      boundaryIndex = ledger.state.legacyBlockBoundary;
      legacyDecimals = LEGACY_DECIMALS;
      currentDecimals = TOKEN_DECIMALS;
    };
  };

  // Every non-zero balance (fee collector included), used by the snapshot export.
  public func listBalances(ledger : Ledger) : [HolderBalance] {
    ledger.balances.entries()
      .filter(func((_, balance)) = balance > 0)
      .map(func((account, balance)) = { account; balance })
      .toArray();
  };

  // Sale delivery: mint min(amount, mintableRemaining) as "1mint" first; only
  // the part beyond the mint cap is moved from the fee collector to `to` as a
  // fee-0 "1xfer" block. The supply cap is enforced on every mint. Refused
  // (nothing changed) for 0, the fee collector or burn account as recipient,
  // or when mintable + collector balance cannot cover `amount`.
  public func deliverMintFirst(ledger : Ledger, canister : Principal, to : Account, amount : Nat) : DeliveryResult {
    if (amount == 0) {
      return #err(ZERO_AMOUNT_MESSAGE);
    };
    let recipient = normalize(to);
    let collector = feeCollectorAccount(canister);
    if (recipient == collector or recipient == burnAccount(canister)) {
      return #err("This account cannot receive TTTI-T");
    };
    let minted = Nat.min(amount, mintableRemaining(ledger));
    let fromCollector = Nat.sub(amount, minted);
    let collectorBalance = getBalance(ledger, collector);
    if (fromCollector > collectorBalance) {
      return #err("Not enough TTTI-T left to deliver this amount");
    };
    // Definitive cap enforced on every mint.
    if (ledger.state.totalSupply + minted > TOKEN_MAX_SUPPLY) {
      return #err("The 1 TTTI-T max supply would be exceeded");
    };
    let nowTs = now();
    let blockIndices = List.empty<Nat>();
    if (minted > 0) {
      credit(ledger, recipient, minted);
      ledger.state.totalSupply += minted;
      let tx = List.empty<(Text, Value)>();
      tx.add(("to", accountValue(recipient)));
      tx.add(("amt", #Nat(minted)));
      blockIndices.add(appendBlock(ledger, "1mint", nowTs, null, null, tx));
    };
    // Fee-account tokens only for the part beyond the mint cap.
    if (fromCollector > 0) {
      debit(ledger, collector, fromCollector);
      credit(ledger, recipient, fromCollector);
      let tx = List.empty<(Text, Value)>();
      tx.add(("from", accountValue(collector)));
      tx.add(("to", accountValue(recipient)));
      tx.add(("amt", #Nat(fromCollector)));
      blockIndices.add(appendBlock(ledger, "1xfer", nowTs, ?0, null, tx));
    };
    #ok({ minted; fromCollector; blockIndices = blockIndices.toArray() });
  };
};
