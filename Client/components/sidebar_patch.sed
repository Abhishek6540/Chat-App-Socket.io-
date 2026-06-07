189,200c\
          <input\
            type="text"\
            placeholder={\
              activeTab === 'conversations'\
                ? 'Search chats...'\
                : activeTab === 'contacts'\
                  ? 'Search contacts...'\
                  : 'Search calls...'\
            }\
            value={searchQuery}\
            onChange={(e) =>\
              setSearchQuery(e.target.value)\
            }\
            className="w-full rounded-full bg-sidebar-accent py-2 pl-10 pr-4 text-sm text-sidebar-foreground placeholder-sidebar-accent-foreground/50 outline-none focus:ring-2 focus:ring-sidebar-ring"\
          />
