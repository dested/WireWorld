(module
 (type $v (func))
 (type $iii (func (param i32 i32) (result i32)))
 (memory $0 0)
 (table $0 1 anyfunc)
 (elem (i32.const 0) $null)
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
 (func $assembly/index/loadCopper (; 1 ;) (type $iii) (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  get_local $0
  i32.const 8
  i32.mul
  get_local $1
  i32.const 255
  i32.and
  i32.add
  set_local $2
  get_local $2
  i32.const 2
  i32.shl
  i32.load
 )
 (func $assembly/index/tick (; 2 ;) (type $v)
  (local $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  i32.const 0
  set_local $0
  block $break|0
   i32.const 0
   set_local $1
   loop $repeat|0
    get_local $1
    i32.const 605129
    i32.lt_s
    i32.eqz
    br_if $break|0
    block
     block $assembly/index/loadBit|inlined.0 (result i32)
      i32.const 5446161
      get_local $1
      i32.add
      set_local $2
      get_local $2
      i32.const 2
      i32.shl
      i32.load
     end
     set_local $2
     get_local $2
     i32.const 0
     i32.eq
     if
      br $break|0
     end
     block $break|1
      i32.const 0
      set_local $3
      loop $repeat|1
       get_local $3
       i32.const 8
       i32.lt_u
       i32.eqz
       br_if $break|1
       block
        get_local $2
        get_local $3
        call $assembly/index/loadCopper
        set_local $4
        get_local $4
        i32.const 0
        i32.eq
        if
         br $break|1
        end
        block $assembly/index/loadBit|inlined.5 (result i32)
         i32.const 7261548
         get_local $4
         i32.add
         set_local $5
         get_local $5
         i32.const 2
         i32.shl
         i32.load
        end
        i32.const 0
        i32.eq
        tee_local $5
        if (result i32)
         block $assembly/index/loadBit|inlined.6 (result i32)
          i32.const 6051290
          get_local $4
          i32.add
          set_local $5
          get_local $5
          i32.const 2
          i32.shl
          i32.load
         end
         i32.const 0
         i32.eq
        else         
         get_local $5
        end
        tee_local $5
        i32.const 0
        i32.ne
        if (result i32)
         block $assembly/index/loadBit|inlined.7 (result i32)
          i32.const 8471806
          get_local $4
          i32.add
          set_local $5
          get_local $5
          i32.const 2
          i32.shl
          i32.load
         end
         i32.const 0
         i32.eq
        else         
         get_local $5
        end
        i32.const 0
        i32.ne
        if
         i32.const 0
         set_local $5
         block $break|2
          i32.const 0
          set_local $6
          loop $repeat|2
           get_local $6
           i32.const 8
           i32.lt_u
           i32.eqz
           br_if $break|2
           block
            get_local $4
            get_local $6
            call $assembly/index/loadCopper
            set_local $7
            get_local $7
            i32.const 0
            i32.eq
            if
             br $break|2
            end
            block $assembly/index/loadBit|inlined.9 (result i32)
             i32.const 6051290
             get_local $7
             i32.add
             set_local $8
             get_local $8
             i32.const 2
             i32.shl
             i32.load
            end
            i32.const 1
            i32.eq
            if
             get_local $5
             i32.const 1
             i32.add
             set_local $5
             get_local $5
             i32.const 3
             i32.eq
             if
              i32.const 0
              set_local $5
              br $break|2
             end
            end
           end
           get_local $6
           i32.const 1
           i32.add
           set_local $6
           br $repeat|2
           unreachable
          end
          unreachable
         end
         get_local $5
         i32.const 0
         i32.gt_s
         if
          i32.const 8471806
          get_local $4
          i32.add
          set_local $6
          i32.const 1
          set_local $7
          get_local $6
          i32.const 2
          i32.shl
          get_local $7
          i32.store
          i32.const 7866677
          get_local $0
          i32.add
          set_local $7
          get_local $7
          i32.const 2
          i32.shl
          get_local $4
          i32.store
          get_local $0
          i32.const 1
          i32.add
          set_local $0
         end
        end
       end
       get_local $3
       i32.const 1
       i32.add
       set_local $3
       br $repeat|1
       unreachable
      end
      unreachable
     end
    end
    get_local $1
    i32.const 1
    i32.add
    set_local $1
    br $repeat|0
    unreachable
   end
   unreachable
  end
 )
 (func $null (; 3 ;) (type $v)
 )
)
