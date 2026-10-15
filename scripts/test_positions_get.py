import MetaTrader5 as mt5

if mt5.initialize():
    pos_all = mt5.positions_get()
    print("All positions:", pos_all)
    if pos_all:
        ticket = pos_all[0].ticket
        print("Test ticket:", ticket)
        by_ticket = mt5.positions_get(ticket=ticket)
        print("positions_get(ticket=...):", by_ticket)
    mt5.shutdown()
