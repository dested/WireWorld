(module
 (type $v (func))
 (memory $0 0)
 (table $0 1 anyfunc)
 (elem (i32.const 0) $null)
 (global $assembly/index/copperLen i32 (i32.const 8))
 (global $assembly/index/size i32 (i32.const 605129))
 (global $assembly/index/arrLen i32 (i32.const 7000))
 (global $assembly/index/coppersSize i32 (i32.const 4841032))
 (global $assembly/index/headsArrayOffset i32 (i32.const 5446161))
 (global $assembly/index/headsGridOffset i32 (i32.const 5453161))
 (global $assembly/index/tailsArrayOffset i32 (i32.const 6058290))
 (global $assembly/index/tailsGridOffset i32 (i32.const 6065290))
 (global $assembly/index/newHeadsArrayOffset i32 (i32.const 6670419))
 (global $assembly/index/newHeadsGridOffset i32 (i32.const 6677419))
 (global $assembly/index/newTailsArrayOffset i32 (i32.const 7282548))
 (global $assembly/index/newTailsGridOffset i32 (i32.const 7289548))
 (global $HEAP_BASE i32 (i32.const 8))
 (export "memory" (memory $0))
 (export "table" (table $0))
 (export "init" (func $assembly/index/init))
 (export "tick" (func $assembly/index/tick))
 (func $assembly/index/init (; 0 ;) (type $v)
  i32.const 800
  grow_memory
  drop
 )
 (func $assembly/index/tick (; 1 ;) (type $v)
  (local $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  i32.const 0
  set_local $0
  block $assembly/index/loadBit|inlined.0 (result i32)
   get_global $assembly/index/headsArrayOffset
   set_local $1
   get_local $1
   i32.const 2
   i32.shl
   i32.load
  end
  set_local $1
  block $break|0
   i32.const 1
   set_local $2
   loop $repeat|0
    get_local $2
    get_local $1
    i32.le_u
    i32.eqz
    br_if $break|0
    block
     block $assembly/index/loadBit|inlined.1 (result i32)
      get_global $assembly/index/headsArrayOffset
      get_local $2
      i32.add
      set_local $3
      get_local $3
      i32.const 2
      i32.shl
      i32.load
     end
     set_local $3
     block $assembly/index/loadBit|inlined.2 (result i32)
      get_local $3
      get_global $assembly/index/copperLen
      i32.mul
      set_local $4
      get_local $4
      i32.const 2
      i32.shl
      i32.load
     end
     set_local $4
     block $break|1
      i32.const 0
      set_local $5
      loop $repeat|1
       get_local $5
       get_local $4
       i32.lt_u
       i32.eqz
       br_if $break|1
       block
        block $assembly/index/loadCopper|inlined.0 (result i32)
         block $assembly/index/loadBit|inlined.3 (result i32)
          get_local $3
          get_global $assembly/index/copperLen
          i32.mul
          get_local $5
          i32.const 255
          i32.and
          i32.add
          i32.const 1
          i32.add
          set_local $6
          get_local $6
          i32.const 2
          i32.shl
          i32.load
         end
        end
        set_local $6
        block $assembly/index/loadBit|inlined.7 (result i32)
         get_global $assembly/index/tailsGridOffset
         get_local $6
         i32.add
         set_local $7
         get_local $7
         i32.const 2
         i32.shl
         i32.load
        end
        i32.const 0
        i32.eq
        tee_local $7
        if (result i32)
         block $assembly/index/loadBit|inlined.8 (result i32)
          get_global $assembly/index/headsGridOffset
          get_local $6
          i32.add
          set_local $7
          get_local $7
          i32.const 2
          i32.shl
          i32.load
         end
         i32.const 0
         i32.eq
        else         
         get_local $7
        end
        tee_local $7
        i32.const 0
        i32.ne
        if (result i32)
         block $assembly/index/loadBit|inlined.9 (result i32)
          get_global $assembly/index/newHeadsGridOffset
          get_local $6
          i32.add
          set_local $7
          get_local $7
          i32.const 2
          i32.shl
          i32.load
         end
         i32.const 0
         i32.eq
        else         
         get_local $7
        end
        i32.const 0
        i32.ne
        if
         i32.const 0
         set_local $7
         block $assembly/index/loadBit|inlined.10 (result i32)
          get_local $6
          get_global $assembly/index/copperLen
          i32.mul
          set_local $8
          get_local $8
          i32.const 2
          i32.shl
          i32.load
         end
         set_local $8
         block $break|2
          i32.const 0
          set_local $9
          loop $repeat|2
           get_local $9
           get_local $8
           i32.lt_u
           i32.eqz
           br_if $break|2
           block
            block $assembly/index/loadCopper|inlined.1 (result i32)
             block $assembly/index/loadBit|inlined.11 (result i32)
              get_local $6
              get_global $assembly/index/copperLen
              i32.mul
              get_local $9
              i32.const 255
              i32.and
              i32.add
              i32.const 1
              i32.add
              set_local $10
              get_local $10
              i32.const 2
              i32.shl
              i32.load
             end
            end
            set_local $10
            block $assembly/index/loadBit|inlined.13 (result i32)
             get_global $assembly/index/headsGridOffset
             get_local $10
             i32.add
             set_local $11
             get_local $11
             i32.const 2
             i32.shl
             i32.load
            end
            i32.const 1
            i32.eq
            if
             get_local $7
             i32.const 1
             i32.add
             set_local $7
             get_local $7
             i32.const 3
             i32.eq
             if
              i32.const 0
              set_local $7
              br $break|2
             end
            end
           end
           get_local $9
           i32.const 1
           i32.add
           set_local $9
           br $repeat|2
           unreachable
          end
          unreachable
         end
         get_local $7
         i32.const 0
         i32.gt_s
         if
          get_global $assembly/index/newHeadsGridOffset
          get_local $6
          i32.add
          set_local $9
          i32.const 1
          set_local $10
          get_local $9
          i32.const 2
          i32.shl
          get_local $10
          i32.store
          get_global $assembly/index/newHeadsArrayOffset
          get_local $0
          i32.add
          i32.const 1
          i32.add
          set_local $10
          get_local $10
          i32.const 2
          i32.shl
          get_local $6
          i32.store
          get_local $0
          i32.const 1
          i32.add
          set_local $0
         end
        end
       end
       get_local $5
       i32.const 1
       i32.add
       set_local $5
       br $repeat|1
       unreachable
      end
      unreachable
     end
    end
    get_local $2
    i32.const 1
    i32.add
    set_local $2
    br $repeat|0
    unreachable
   end
   unreachable
  end
  get_global $assembly/index/newHeadsArrayOffset
  set_local $2
  get_local $2
  i32.const 2
  i32.shl
  get_local $0
  i32.store
 )
 (func $null (; 2 ;) (type $v)
 )
)
